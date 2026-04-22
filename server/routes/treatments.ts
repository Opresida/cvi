import { Router } from "express";
import { db } from "../db";
import { monthlyTreatments, users, punchRecords, punchAdjustments } from "../db/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";

const router = Router();
router.use(authMiddleware);

const MONTH_REGEX = /^\d{4}-\d{2}$/;

function monthToFirstDay(month: string): string {
  return `${month}-01`;
}

// GET /api/treatments — admin lista todos (filtrado por mês opcional);
// funcionário só vê os próprios que já foram enviados para revisão
router.get("/", async (req: AuthRequest, res) => {
  try {
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";
    const month = req.query.month as string | undefined;

    const conditions = [];
    if (month) {
      if (!MONTH_REGEX.test(month)) return res.status(400).json({ error: "Formato de mês inválido (use YYYY-MM)" });
      conditions.push(eq(monthlyTreatments.referenceMonth, monthToFirstDay(month)));
    }
    if (!isStaff) {
      conditions.push(eq(monthlyTreatments.userId, req.user!.userId));
      // Funcionário só vê tratamentos que já saíram do draft
      // (essa regra vai ser útil no Bloco 6; por ora funcionário também só vê não-draft)
    }

    const query = db
      .select({
        id: monthlyTreatments.id,
        userId: monthlyTreatments.userId,
        userName: users.name,
        userDepartment: users.department,
        referenceMonth: monthlyTreatments.referenceMonth,
        discountAmount: monthlyTreatments.discountAmount,
        bonusAmount: monthlyTreatments.bonusAmount,
        notes: monthlyTreatments.notes,
        status: monthlyTreatments.status,
        submittedAt: monthlyTreatments.submittedAt,
        decisionAt: monthlyTreatments.decisionAt,
        employeeQuestion: monthlyTreatments.employeeQuestion,
        createdAt: monthlyTreatments.createdAt,
        updatedAt: monthlyTreatments.updatedAt,
      })
      .from(monthlyTreatments)
      .innerJoin(users, eq(monthlyTreatments.userId, users.id));

    const records = conditions.length
      ? await query.where(and(...conditions)).orderBy(desc(monthlyTreatments.referenceMonth), users.name)
      : await query.orderBy(desc(monthlyTreatments.referenceMonth), users.name);

    return res.json({ treatments: records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao listar tratamentos:`, err);
    return res.status(500).json({ error: "Erro ao listar tratamentos", errorId });
  }
});

// GET /api/treatments/summary/:id — retorna tratamento + pontos do mês + ajustes do mês
// Path com prefixo /summary pra não colidir com GET /:userId/:month
// Acessível pelo dono OU admin/gestor
router.get("/summary/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [treatment] = await db.select().from(monthlyTreatments).where(eq(monthlyTreatments.id, id)).limit(1);
    if (!treatment) return res.status(404).json({ error: "Tratamento não encontrado" });

    const isOwner = treatment.userId === req.user!.userId;
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";
    if (!isOwner && !isStaff) return res.status(403).json({ error: "Sem permissão" });

    // Janela do mês: referenceMonth é o primeiro dia
    const refDate = new Date(treatment.referenceMonth + "T00:00:00Z");
    const monthStart = new Date(Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth() + 1, 0, 23, 59, 59));

    const punches = await db
      .select()
      .from(punchRecords)
      .where(and(
        eq(punchRecords.userId, treatment.userId),
        gte(punchRecords.timestamp, monthStart),
        lte(punchRecords.timestamp, monthEnd),
      ))
      .orderBy(punchRecords.timestamp);

    const adjustments = await db
      .select({
        id: punchAdjustments.id,
        requestedType: punchAdjustments.requestedType,
        requestedTimestamp: punchAdjustments.requestedTimestamp,
        reason: punchAdjustments.reason,
        attachmentFileId: punchAdjustments.attachmentFileId,
        status: punchAdjustments.status,
        reviewNotes: punchAdjustments.reviewNotes,
        createdAt: punchAdjustments.createdAt,
        reviewedAt: punchAdjustments.reviewedAt,
      })
      .from(punchAdjustments)
      .where(and(
        eq(punchAdjustments.userId, treatment.userId),
        gte(punchAdjustments.requestedTimestamp, monthStart),
        lte(punchAdjustments.requestedTimestamp, monthEnd),
      ))
      .orderBy(desc(punchAdjustments.createdAt));

    const [owner] = await db
      .select({ name: users.name, department: users.department })
      .from(users)
      .where(eq(users.id, treatment.userId))
      .limit(1);

    return res.json({
      treatment,
      employee: owner || null,
      punchRecords: punches,
      adjustments,
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao gerar summary:`, err);
    return res.status(500).json({ error: "Erro ao buscar detalhes", errorId });
  }
});

// GET /api/treatments/:userId/:month — detalhe de um tratamento (cria implicitamente se não existir, só para admin)
router.get("/:userId/:month", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const month = req.params.month;
    if (isNaN(userId) || userId <= 0) return res.status(400).json({ error: "ID de usuário inválido" });
    if (!MONTH_REGEX.test(month)) return res.status(400).json({ error: "Formato de mês inválido (use YYYY-MM)" });

    const refMonth = monthToFirstDay(month);

    const [treatment] = await db
      .select()
      .from(monthlyTreatments)
      .where(and(
        eq(monthlyTreatments.userId, userId),
        eq(monthlyTreatments.referenceMonth, refMonth),
      ))
      .limit(1);

    return res.json({ treatment: treatment || null });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro:`, err);
    return res.status(500).json({ error: "Erro ao buscar tratamento", errorId });
  }
});

// POST /api/treatments — admin cria ou atualiza (upsert por userId+month)
router.post("/", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId, month, discountAmount, bonusAmount, notes } = req.body;

    if (!userId || !month) {
      return res.status(400).json({ error: "userId e month são obrigatórios" });
    }
    const uid = parseInt(userId);
    if (isNaN(uid) || uid <= 0) return res.status(400).json({ error: "userId inválido" });
    if (!MONTH_REGEX.test(month)) return res.status(400).json({ error: "Formato de mês inválido (use YYYY-MM)" });

    const discount = parseFloat(discountAmount || "0");
    const bonus = parseFloat(bonusAmount || "0");
    if (isNaN(discount) || discount < 0) return res.status(400).json({ error: "Desconto inválido" });
    if (isNaN(bonus) || bonus < 0) return res.status(400).json({ error: "Abono inválido" });

    const refMonth = monthToFirstDay(month);

    // Verificar existência do funcionário
    const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, uid)).limit(1);
    if (!target) return res.status(404).json({ error: "Funcionário não encontrado" });

    const sanitizedNotes = notes ? sanitizeHtml(String(notes).slice(0, 2000)) : null;

    // Upsert: se já existe, atualiza; senão, cria
    const [existing] = await db
      .select()
      .from(monthlyTreatments)
      .where(and(eq(monthlyTreatments.userId, uid), eq(monthlyTreatments.referenceMonth, refMonth)))
      .limit(1);

    if (existing) {
      // Só permite editar se status for draft ou questioned (volta pra correção)
      if (!["draft", "questioned"].includes(existing.status)) {
        return res.status(409).json({
          error: `Tratamento já está em status '${existing.status}' — não pode mais ser alterado`,
        });
      }
      const [updated] = await db
        .update(monthlyTreatments)
        .set({
          discountAmount: discount.toFixed(2),
          bonusAmount: bonus.toFixed(2),
          notes: sanitizedNotes,
          status: "draft", // volta pra draft se estava em questioned
          updatedAt: new Date(),
        })
        .where(eq(monthlyTreatments.id, existing.id))
        .returning();
      return res.json({ treatment: updated, action: "updated" });
    }

    const [created] = await db
      .insert(monthlyTreatments)
      .values({
        userId: uid,
        referenceMonth: refMonth,
        discountAmount: discount.toFixed(2),
        bonusAmount: bonus.toFixed(2),
        notes: sanitizedNotes,
        status: "draft",
        processedBy: req.user!.userId,
      })
      .returning();

    return res.status(201).json({ treatment: created, action: "created" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao salvar tratamento:`, err);
    return res.status(500).json({ error: "Erro ao salvar tratamento", errorId });
  }
});

// POST /api/treatments/:id/submit — admin envia pra revisão do funcionário (inicia timer 24h)
router.post("/:id/submit", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [existing] = await db.select().from(monthlyTreatments).where(eq(monthlyTreatments.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Tratamento não encontrado" });

    if (!["draft", "questioned"].includes(existing.status)) {
      return res.status(409).json({
        error: `Só é possível enviar tratamentos em draft ou questionados (atual: ${existing.status})`,
      });
    }

    const [updated] = await db
      .update(monthlyTreatments)
      .set({
        status: "submitted_to_employee",
        submittedAt: new Date(),
        decisionAt: null,
        employeeQuestion: null,
        updatedAt: new Date(),
      })
      .where(eq(monthlyTreatments.id, id))
      .returning();

    return res.json({ treatment: updated });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao submeter tratamento:`, err);
    return res.status(500).json({ error: "Erro ao enviar para revisão", errorId });
  }
});

// POST /api/treatments/:id/approve — funcionário aprova seu próprio tratamento
router.post("/:id/approve", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [existing] = await db.select().from(monthlyTreatments).where(eq(monthlyTreatments.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Tratamento não encontrado" });

    if (existing.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Só o próprio funcionário pode aprovar" });
    }
    if (existing.status !== "submitted_to_employee") {
      return res.status(409).json({ error: `Tratamento não está aguardando revisão (atual: ${existing.status})` });
    }

    const [updated] = await db
      .update(monthlyTreatments)
      .set({ status: "approved_by_employee", decisionAt: new Date(), updatedAt: new Date() })
      .where(eq(monthlyTreatments.id, id))
      .returning();

    return res.json({ treatment: updated });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao aprovar:`, err);
    return res.status(500).json({ error: "Erro ao aprovar tratamento", errorId });
  }
});

// POST /api/treatments/:id/question — funcionário questiona
router.post("/:id/question", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const { question } = req.body;
    if (!question || typeof question !== "string" || question.trim().length < 10) {
      return res.status(400).json({ error: "Descreva sua questão com pelo menos 10 caracteres" });
    }

    const [existing] = await db.select().from(monthlyTreatments).where(eq(monthlyTreatments.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Tratamento não encontrado" });

    if (existing.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Só o próprio funcionário pode questionar" });
    }
    if (existing.status !== "submitted_to_employee") {
      return res.status(409).json({ error: `Tratamento não está aguardando revisão (atual: ${existing.status})` });
    }

    const [updated] = await db
      .update(monthlyTreatments)
      .set({
        status: "questioned",
        decisionAt: new Date(),
        employeeQuestion: sanitizeHtml(question.trim().slice(0, 2000)),
        updatedAt: new Date(),
      })
      .where(eq(monthlyTreatments.id, id))
      .returning();

    return res.json({ treatment: updated });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao questionar:`, err);
    return res.status(500).json({ error: "Erro ao registrar questionamento", errorId });
  }
});

// DELETE /api/treatments/:id — admin remove (apenas se ainda draft)
router.delete("/:id", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [existing] = await db.select().from(monthlyTreatments).where(eq(monthlyTreatments.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Tratamento não encontrado" });
    if (existing.status !== "draft") {
      return res.status(409).json({ error: "Só é possível remover tratamentos em draft" });
    }

    await db.delete(monthlyTreatments).where(eq(monthlyTreatments.id, id));
    return res.json({ message: "Tratamento removido" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao remover tratamento:`, err);
    return res.status(500).json({ error: "Erro ao remover tratamento", errorId });
  }
});

export default router;
