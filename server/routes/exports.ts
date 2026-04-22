import { Router } from "express";
import archiver from "archiver";
import { db } from "../db";
import { monthlyTreatments, users, punchRecords, punchAdjustments, salaryHistory } from "../db/schema";
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { generateFolhaPdf, type FolhaPdfEmployee } from "../utils/pdfFolha";

const router = Router();
router.use(authMiddleware);
router.use(gestorOrAdmin);

const MONTH_REGEX = /^\d{4}-\d{2}$/;
const PUNCH_LABEL: Record<string, string> = {
  entrada: "Entrada",
  saida_almoco: "Saida Almoco",
  volta_almoco: "Volta Almoco",
  saida: "Saida",
};
const ADJ_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cols: unknown[]): string {
  return cols.map(escapeCsv).join(",") + "\n";
}

function slug(name: string): string {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function formatDateBR(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("pt-BR", { timeZone: "America/Manaus", day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTimeBR(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("pt-BR", { timeZone: "America/Manaus", hour: "2-digit", minute: "2-digit" });
}

function formatBRLNumeric(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

// GET /api/exports/monthly?month=YYYY-MM&status=all|approved
router.get("/monthly", async (req: AuthRequest, res) => {
  try {
    const month = req.query.month as string;
    if (!month || !MONTH_REGEX.test(month)) {
      return res.status(400).json({ error: "Parâmetro ?month=YYYY-MM obrigatório" });
    }
    const statusFilter = (req.query.status as string) || "approved";

    const refMonthStr = `${month}-01`;
    const [year, monthNum] = month.split("-").map(Number);
    const monthStart = new Date(Date.UTC(year, monthNum - 1, 1));
    const monthEnd = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59));

    // Buscar tratamentos do mês
    const statusList = statusFilter === "all"
      ? ["draft", "submitted_to_employee", "approved_by_employee", "auto_approved", "questioned"]
      : ["approved_by_employee", "auto_approved"];

    const treatments = await db
      .select({
        id: monthlyTreatments.id,
        userId: monthlyTreatments.userId,
        discountAmount: monthlyTreatments.discountAmount,
        bonusAmount: monthlyTreatments.bonusAmount,
        notes: monthlyTreatments.notes,
        status: monthlyTreatments.status,
        decisionAt: monthlyTreatments.decisionAt,
        submittedAt: monthlyTreatments.submittedAt,
        userName: users.name,
        userEmail: users.email,
        userDepartment: users.department,
        userPosition: users.position,
        userEmploymentType: users.employmentType,
      })
      .from(monthlyTreatments)
      .innerJoin(users, eq(monthlyTreatments.userId, users.id))
      .where(and(
        eq(monthlyTreatments.referenceMonth, refMonthStr),
        inArray(monthlyTreatments.status, statusList),
      ))
      .orderBy(users.name);

    if (treatments.length === 0) {
      return res.status(404).json({
        error: statusFilter === "approved"
          ? "Nenhum tratamento aprovado encontrado nesse mês. Aprove os tratamentos antes de exportar."
          : "Nenhum tratamento encontrado nesse mês.",
      });
    }

    const userIds = treatments.map((t) => t.userId);

    // Salários vigentes no mês (último registro com effectiveFrom <= último dia do mês)
    const salariesRaw = await db
      .select()
      .from(salaryHistory)
      .where(and(
        inArray(salaryHistory.userId, userIds),
        lte(salaryHistory.effectiveFrom, `${year}-${String(monthNum).padStart(2, "0")}-${new Date(year, monthNum, 0).getDate()}`),
      ))
      .orderBy(desc(salaryHistory.effectiveFrom));
    const salariesByUser: Record<number, { gross: number; net: number; effectiveFrom: string } | null> = {};
    for (const s of salariesRaw) {
      if (!salariesByUser[s.userId]) {
        salariesByUser[s.userId] = {
          gross: parseFloat(s.grossSalary),
          net: parseFloat(s.netSalary),
          effectiveFrom: s.effectiveFrom,
        };
      }
    }

    // Pontos do mês de todos os funcionários alvo
    const punches = await db
      .select()
      .from(punchRecords)
      .where(and(
        inArray(punchRecords.userId, userIds),
        gte(punchRecords.timestamp, monthStart),
        lte(punchRecords.timestamp, monthEnd),
      ))
      .orderBy(punchRecords.timestamp);
    const punchesByUser: Record<number, typeof punches> = {};
    for (const p of punches) {
      if (!punchesByUser[p.userId]) punchesByUser[p.userId] = [];
      punchesByUser[p.userId].push(p);
    }

    // Ajustes do mês
    const adjs = await db
      .select()
      .from(punchAdjustments)
      .where(and(
        inArray(punchAdjustments.userId, userIds),
        gte(punchAdjustments.requestedTimestamp, monthStart),
        lte(punchAdjustments.requestedTimestamp, monthEnd),
      ))
      .orderBy(punchAdjustments.requestedTimestamp);
    const adjsByUser: Record<number, typeof adjs> = {};
    for (const a of adjs) {
      if (!adjsByUser[a.userId]) adjsByUser[a.userId] = [];
      adjsByUser[a.userId].push(a);
    }

    // Gerar ZIP em stream
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="folha-${month}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("Erro no archiver:", err);
      try { res.status(500).end(); } catch { /* ignore */ }
    });
    archive.pipe(res);

    // BOM pra Excel reconhecer UTF-8
    const BOM = "﻿";

    // ===== CSV consolidado =====
    let consolidado = BOM + csvRow([
      "Funcionario", "Email", "Departamento", "Cargo", "Vinculo",
      "Salario Bruto (R$)", "Salario Liquido (R$)",
      "Desconto (R$)", "Abono (R$)",
      "Total a Pagar (R$)",
      "Status Tratamento", "Decidido em",
    ]);

    for (const t of treatments) {
      const sal = salariesByUser[t.userId];
      const bruto = sal?.gross ?? 0;
      const liquido = sal?.net ?? 0;
      const desc = parseFloat(t.discountAmount);
      const abono = parseFloat(t.bonusAmount);
      const total = liquido - desc + abono;
      consolidado += csvRow([
        t.userName,
        t.userEmail,
        t.userDepartment || "",
        t.userPosition || "",
        (t.userEmploymentType || "").toUpperCase(),
        formatBRLNumeric(bruto),
        formatBRLNumeric(liquido),
        formatBRLNumeric(desc),
        formatBRLNumeric(abono),
        formatBRLNumeric(total),
        t.status,
        t.decisionAt ? formatDateBR(t.decisionAt) : "",
      ]);
    }

    archive.append(consolidado, { name: `folha-consolidada-${month}.csv` });

    // ===== README =====
    const readme = [
      `Folha de Ponto - CVI Amazonas`,
      `Mes de referencia: ${month}`,
      `Gerado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Manaus" })}`,
      `Total de funcionarios: ${treatments.length}`,
      ``,
      `Estrutura:`,
      `  folha-${month}.zip`,
      `  |-- LEIAME.txt                         (este arquivo)`,
      `  |-- folha-consolidada-${month}.csv     (planilha resumo - 1 linha por funcionario)`,
      `  \\-- <Nome do Funcionario>/`,
      `        |-- pontos.csv                   (todos os pontos batidos no mes)`,
      `        |-- ajustes.csv                  (ajustes solicitados com status)`,
      `        |-- resumo.txt                   (dados do tratamento: bruto, liquido, desconto, abono, total)`,
      `        \\-- notas-rh.txt                (observacoes do RH - se houver)`,
      ``,
      `Status dos tratamentos inclusos: ${statusList.join(", ")}`,
      `Obs: valores em reais usam virgula como separador decimal.`,
    ].join("\n");
    archive.append(BOM + readme, { name: "LEIAME.txt" });

    // ===== Pasta por funcionário =====
    for (const t of treatments) {
      const folder = (t.userName || `funcionario-${t.userId}`).trim();
      const sal = salariesByUser[t.userId];
      const bruto = sal?.gross ?? 0;
      const liquido = sal?.net ?? 0;
      const desc = parseFloat(t.discountAmount);
      const abono = parseFloat(t.bonusAmount);
      const total = liquido - desc + abono;

      // resumo.txt — visão geral do funcionário e cálculo
      const resumo = [
        `Resumo do Tratamento - ${t.userName}`,
        `Mes de referencia: ${month}`,
        `-----------------------------------------`,
        ``,
        `Dados do funcionario`,
        `  Email: ${t.userEmail}`,
        `  Departamento: ${t.userDepartment || "-"}`,
        `  Cargo: ${t.userPosition || "-"}`,
        `  Vinculo: ${(t.userEmploymentType || "").toUpperCase()}`,
        ``,
        `Remuneracao`,
        `  Salario bruto:   R$ ${formatBRLNumeric(bruto)}`,
        `  Salario liquido: R$ ${formatBRLNumeric(liquido)}`,
        sal ? `  (vigente desde ${formatDateBR(sal.effectiveFrom + "T12:00:00")})` : `  (salario nao cadastrado)`,
        ``,
        `Ajustes do mes (aplicados pelo RH)`,
        `  Desconto: R$ ${formatBRLNumeric(desc)}`,
        `  Abono:    R$ ${formatBRLNumeric(abono)}`,
        ``,
        `=========================================`,
        `TOTAL A PAGAR: R$ ${formatBRLNumeric(total)}`,
        `=========================================`,
        ``,
        `Status do tratamento: ${t.status}`,
        t.submittedAt ? `Enviado ao funcionario em: ${formatDateBR(t.submittedAt)}` : "",
        t.decisionAt ? `Decisao em: ${formatDateBR(t.decisionAt)}` : "",
      ].filter(Boolean).join("\n");
      archive.append(BOM + resumo, { name: `${folder}/resumo.txt` });

      // pontos.csv
      let punchCsv = BOM + csvRow(["Data", "Hora", "Tipo", "Status", "Distancia (m)", "Observacao"]);
      const userPunches = punchesByUser[t.userId] || [];
      for (const p of userPunches) {
        punchCsv += csvRow([
          formatDateBR(p.timestamp),
          formatTimeBR(p.timestamp),
          PUNCH_LABEL[p.type] || p.type,
          p.status,
          p.distanceFromSede || "",
          p.notes || "",
        ]);
      }
      if (userPunches.length === 0) {
        punchCsv += csvRow(["(sem registros de ponto no mes)"]);
      }
      archive.append(punchCsv, { name: `${folder}/pontos.csv` });

      // ajustes.csv
      let adjCsv = BOM + csvRow(["Data solicitada", "Tipo", "Motivo", "Status", "Revisto em", "Observacao RH", "Tem anexo"]);
      const userAdjs = adjsByUser[t.userId] || [];
      for (const a of userAdjs) {
        adjCsv += csvRow([
          new Date(a.requestedTimestamp).toLocaleString("pt-BR", { timeZone: "America/Manaus" }),
          PUNCH_LABEL[a.requestedType] || a.requestedType,
          a.reason,
          ADJ_STATUS_LABEL[a.status] || a.status,
          a.reviewedAt ? formatDateBR(a.reviewedAt) : "",
          a.reviewNotes || "",
          a.attachmentFileId ? "Sim" : "Nao",
        ]);
      }
      if (userAdjs.length === 0) {
        adjCsv += csvRow(["(sem ajustes solicitados no mes)"]);
      }
      archive.append(adjCsv, { name: `${folder}/ajustes.csv` });

      // notas-rh.txt (só se tiver notas)
      if (t.notes) {
        const notas = `Observacoes do RH - ${t.userName} - ${month}\n\n${t.notes}\n`;
        archive.append(BOM + notas, { name: `${folder}/notas-rh.txt` });
      }
    }

    // ===== PDF institucional (opcional via ?pdf=1) =====
    if (req.query.pdf === "1") {
      try {
        const pdfEmployees: FolhaPdfEmployee[] = treatments.map((t) => {
          const sal = salariesByUser[t.userId];
          const bruto = sal?.gross ?? 0;
          const liquido = sal?.net ?? 0;
          const desc = parseFloat(t.discountAmount);
          const abono = parseFloat(t.bonusAmount);
          const punchesFormatted = (punchesByUser[t.userId] || []).map((p) => ({
            timestamp: typeof p.timestamp === "string" ? p.timestamp : p.timestamp.toISOString(),
            type: p.type,
            status: p.status,
          }));
          const adjsFormatted = (adjsByUser[t.userId] || []).map((a) => ({
            requestedType: a.requestedType,
            requestedTimestamp: typeof a.requestedTimestamp === "string" ? a.requestedTimestamp : a.requestedTimestamp.toISOString(),
            reason: a.reason,
            status: a.status,
            reviewNotes: a.reviewNotes,
          }));
          return {
            userName: t.userName,
            userEmail: t.userEmail,
            userDepartment: t.userDepartment,
            userPosition: t.userPosition,
            userEmploymentType: t.userEmploymentType,
            grossSalary: bruto,
            netSalary: liquido,
            salaryEffectiveFrom: sal?.effectiveFrom || null,
            discountAmount: desc,
            bonusAmount: abono,
            totalToPay: liquido - desc + abono,
            treatmentStatus: t.status,
            treatmentNotes: t.notes,
            decisionAt: t.decisionAt ? (typeof t.decisionAt === "string" ? t.decisionAt : t.decisionAt.toISOString()) : null,
            punches: punchesFormatted,
            adjustments: adjsFormatted,
          };
        });

        const monthLabelPt = new Date(year, monthNum - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

        // Buscar nome do usuário que está exportando (pra assinatura)
        const [currentUser] = await db
          .select({ name: users.name, role: users.role, position: users.position })
          .from(users)
          .where(eq(users.id, req.user!.userId))
          .limit(1);
        const sigName = currentUser?.name || "Administrador";
        const sigRole = currentUser?.position || (currentUser?.role === "admin" ? "Administrador" : "Gestor");

        const pdfBytes = await generateFolhaPdf({
          month,
          monthLabel: monthLabelPt.charAt(0).toUpperCase() + monthLabelPt.slice(1),
          generatedByName: sigName,
          generatedByRole: sigRole,
          employees: pdfEmployees,
        });

        archive.append(Buffer.from(pdfBytes), { name: `folha-${month}.pdf` });
      } catch (pdfErr) {
        console.error("Erro ao gerar PDF:", pdfErr);
        archive.append(`Erro ao gerar PDF: ${(pdfErr as Error).message}`, { name: "PDF-ERRO.txt" });
      }
    }

    await archive.finalize();
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao exportar folha:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao exportar folha", errorId });
    } else {
      res.end();
    }
  }
});

export default router;
