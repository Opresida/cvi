import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, RGB } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

/**
 * Gera PDF institucional da folha de ponto do CVI Amazonas.
 * Padrão de layout adaptado do projeto IDASAM:
 *  - Cabeçalho e rodapé fixos em todas as páginas
 *  - ensureSpace() protege o conteúdo de sobrepor o rodapé
 *  - Auto page-break com redesenho de header/footer
 */

export interface FolhaPdfEmployee {
  userName: string;
  userEmail: string;
  userDepartment: string | null;
  userPosition: string | null;
  userEmploymentType: string | null;
  grossSalary: number;
  netSalary: number;
  salaryEffectiveFrom: string | null;
  discountAmount: number;
  bonusAmount: number;
  totalToPay: number;
  treatmentStatus: string;
  treatmentNotes: string | null;
  decisionAt: string | null;
  punches: Array<{ timestamp: string; type: string; status: string }>;
  adjustments: Array<{
    requestedType: string;
    requestedTimestamp: string;
    reason: string;
    status: string;
    reviewNotes: string | null;
  }>;
}

export interface FolhaPdfParams {
  month: string;                  // "2026-04"
  monthLabel: string;              // "Abril de 2026"
  generatedByName: string;
  generatedByRole: string;
  employees: FolhaPdfEmployee[];
}

const PUNCH_LABEL: Record<string, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída Almoço",
  volta_almoco: "Volta Almoço",
  saida: "Saída",
};

const ADJ_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const TREATMENT_STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  submitted_to_employee: "Aguardando funcionário",
  approved_by_employee: "Aprovado pelo funcionário",
  auto_approved: "Aprovado automaticamente (24h)",
  questioned: "Questionado",
};

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("pt-BR", { timeZone: "America/Manaus", day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTimeBR(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleTimeString("pt-BR", { timeZone: "America/Manaus", hour: "2-digit", minute: "2-digit" });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateFolhaPdf(params: FolhaPdfParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const W = 595;  // A4 width in points (72dpi)
  const H = 842;  // A4 height

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Paleta CVI (teal)
  const primary = rgb(0.04, 0.46, 0.53);       // #0a7688 — primary-700
  const primaryLight = rgb(0.91, 0.97, 0.98);  // tint pra fundos
  const dark = rgb(0.12, 0.14, 0.17);
  const gray = rgb(0.35, 0.35, 0.35);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const lineColor = rgb(0.85, 0.85, 0.85);
  const white = rgb(1, 1, 1);
  const positiveGreen = rgb(0.06, 0.53, 0.34);
  const negativeRed = rgb(0.83, 0.24, 0.28);

  // Tentar carregar a logo branca do CVI (combina com o fundo azul do header)
  let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
  try {
    const logoPath = path.join(process.cwd(), "src", "assets", "images", "logo-white.png");
    const logoBytes = await fs.readFile(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch {
    // Logo não disponível — segue sem imagem
  }

  const marginL = 50;
  const marginR = 50;
  const maxTextW = W - marginL - marginR;
  const headerH = 85;
  const footerH = 50;
  const contentTop = H - headerH - 35; // gap maior entre cabeçalho e conteúdo
  const contentBottom = footerH + 15;

  let page = pdfDoc.addPage([W, H]);
  let curY = contentTop;
  let pageNumber = 1;

  const drawHeader = (pg: PDFPage) => {
    // Faixa superior
    pg.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: primary });

    // Cálculo da logo preservando aspect ratio com altura máxima
    const logoMaxHeight = 55;
    let logoDisplayWidth = 0;
    if (logoImage) {
      const scale = logoMaxHeight / logoImage.height;
      const w = logoImage.width * scale;
      const h = logoImage.height * scale;
      pg.drawImage(logoImage, {
        x: marginL,
        y: H - headerH + (headerH - h) / 2,
        width: w,
        height: h,
      });
      logoDisplayWidth = w;
    }

    // Texto ao LADO da logo (não em cima)
    const textX = logoImage ? marginL + logoDisplayWidth + 15 : marginL;
    pg.drawText("CVI Amazonas", {
      x: textX, y: H - 38, size: 14, font: fontBold, color: white,
    });
    pg.drawText("Centro de Vida Independente do Amazonas", {
      x: textX, y: H - 53, size: 8, font, color: rgb(0.9, 0.97, 0.98),
    });
    pg.drawText("CNPJ: 07.555.086/0001-68 · cvi.amazonas@gmail.com · (92) 99116-3746", {
      x: textX, y: H - 67, size: 7, font, color: rgb(0.8, 0.92, 0.95),
    });
    // Linha de separação
    pg.drawRectangle({ x: marginL, y: H - headerH - 4, width: maxTextW, height: 1.5, color: primary });
  };

  const drawFooter = (pg: PDFPage, pageNum: number) => {
    pg.drawRectangle({ x: marginL, y: footerH + 5, width: maxTextW, height: 0.8, color: lineColor });
    pg.drawText("Folha de Ponto - CVI Amazonas - Uso interno e confidencial", {
      x: marginL, y: 25, size: 7, font, color: lightGray,
    });
    const dateStr = `Gerado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Manaus" })}`;
    pg.drawText(dateStr, { x: marginL, y: 14, size: 6.5, font, color: lightGray });
    const pageStr = `Página ${pageNum}`;
    const pageW = font.widthOfTextAtSize(pageStr, 7);
    pg.drawText(pageStr, { x: W - marginR - pageW, y: 25, size: 7, font, color: lightGray });
  };

  // ensureSpace: se não tem espaço, quebra página (redesenha header/footer)
  const ensureSpace = (needed: number) => {
    if (curY - needed < contentBottom) {
      drawFooter(page, pageNumber);
      page = pdfDoc.addPage([W, H]);
      pageNumber++;
      drawHeader(page);
      curY = contentTop;
    }
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(32);
    curY -= 6;
    page.drawRectangle({ x: marginL, y: curY - 14, width: maxTextW, height: 20, color: primaryLight });
    page.drawRectangle({ x: marginL, y: curY - 14, width: 3, height: 20, color: primary });
    page.drawText(title, { x: marginL + 10, y: curY - 8, size: 10, font: fontBold, color: primary });
    curY -= 28;
  };

  const drawField = (label: string, value: string | null | undefined, valueColor?: RGB) => {
    if (!value) return;
    ensureSpace(16);
    page.drawText(`${label}:`, { x: marginL, y: curY, size: 8.5, font: fontBold, color: gray });
    const labelW = fontBold.widthOfTextAtSize(`${label}:`, 8.5);
    const availW = maxTextW - labelW - 10;
    const lines = wrapText(String(value), font, 9, availW);
    page.drawText(lines[0] || "", { x: marginL + labelW + 8, y: curY, size: 9, font, color: valueColor || dark });
    curY -= 14;
    for (let i = 1; i < lines.length; i++) {
      ensureSpace(14);
      page.drawText(lines[i], { x: marginL + labelW + 8, y: curY, size: 9, font, color: valueColor || dark });
      curY -= 14;
    }
  };

  const drawParagraph = (text: string, size = 9, color: RGB = dark) => {
    const lines = wrapText(text, font, size, maxTextW);
    for (const line of lines) {
      ensureSpace(size + 4);
      page.drawText(line, { x: marginL, y: curY, size, font, color });
      curY -= size + 4;
    }
  };

  const drawSpacer = (height: number) => {
    ensureSpace(height);
    curY -= height;
  };

  // ============ CAPA (página 1) ============
  drawHeader(page);

  curY = H - headerH - 80;
  const titleText = "Folha de Ponto";
  const titleW = fontBold.widthOfTextAtSize(titleText, 28);
  page.drawText(titleText, { x: (W - titleW) / 2, y: curY, size: 28, font: fontBold, color: dark });
  curY -= 35;

  const monthW = font.widthOfTextAtSize(params.monthLabel, 16);
  page.drawText(params.monthLabel, { x: (W - monthW) / 2, y: curY, size: 16, font, color: primary });
  curY -= 50;

  // Caixa de totais consolidados na capa
  const totalBruto = params.employees.reduce((s, e) => s + e.grossSalary, 0);
  const totalLiquido = params.employees.reduce((s, e) => s + e.netSalary, 0);
  const totalDesconto = params.employees.reduce((s, e) => s + e.discountAmount, 0);
  const totalAbono = params.employees.reduce((s, e) => s + e.bonusAmount, 0);
  const totalPagar = params.employees.reduce((s, e) => s + e.totalToPay, 0);

  const boxW = maxTextW;
  const boxH = 140;
  page.drawRectangle({ x: marginL, y: curY - boxH, width: boxW, height: boxH, color: primaryLight });
  page.drawRectangle({ x: marginL, y: curY, width: boxW, height: 1.5, color: primary });
  page.drawRectangle({ x: marginL, y: curY - boxH, width: boxW, height: 1.5, color: primary });

  let y = curY - 20;
  page.drawText("Resumo Geral", { x: marginL + 15, y, size: 11, font: fontBold, color: primary });
  y -= 22;
  const rowLabelX = marginL + 15;
  const rowValueX = W - marginR - 15;
  const drawSummaryRow = (label: string, value: string, bold = false, color?: RGB) => {
    page.drawText(label, { x: rowLabelX, y, size: 9, font, color: gray });
    const f = bold ? fontBold : font;
    const w = f.widthOfTextAtSize(value, 10);
    page.drawText(value, { x: rowValueX - w, y, size: 10, font: f, color: color || dark });
    y -= 16;
  };
  drawSummaryRow("Funcionários inclusos", String(params.employees.length));
  drawSummaryRow("Total salários brutos", formatBRL(totalBruto));
  drawSummaryRow("Total salários líquidos", formatBRL(totalLiquido));
  drawSummaryRow("Total descontos", formatBRL(totalDesconto), false, negativeRed);
  drawSummaryRow("Total abonos", formatBRL(totalAbono), false, positiveGreen);
  y -= 4;
  page.drawRectangle({ x: rowLabelX, y: y + 10, width: boxW - 30, height: 0.5, color: primary });
  drawSummaryRow("TOTAL A PAGAR", formatBRL(totalPagar), true, primary);

  curY -= boxH + 30;

  // Info de geração
  drawSpacer(10);
  drawField("Gerado em", new Date().toLocaleString("pt-BR", { timeZone: "America/Manaus" }));
  drawField("Por", `${params.generatedByName} (${params.generatedByRole})`);

  drawFooter(page, pageNumber);

  // ============ SUMÁRIO CONSOLIDADO (página 2) ============
  page = pdfDoc.addPage([W, H]);
  pageNumber++;
  drawHeader(page);
  curY = contentTop;

  drawSectionTitle("Sumário Consolidado");

  // Cabeçalho da tabela
  const colX = [marginL, marginL + 180, marginL + 265, marginL + 335, marginL + 405];
  const colWidths = [175, 80, 65, 65, 80];
  const tblHeaderH = 22;
  ensureSpace(tblHeaderH + 12);
  page.drawRectangle({ x: marginL, y: curY - tblHeaderH, width: maxTextW, height: tblHeaderH, color: primary });
  const headers = ["Funcionário", "Líquido", "Desconto", "Abono", "Total"];
  headers.forEach((h, i) => {
    const isNum = i > 0;
    if (isNum) {
      const hw = fontBold.widthOfTextAtSize(h, 9);
      page.drawText(h, { x: colX[i] + colWidths[i] - hw - 4, y: curY - 15, size: 9, font: fontBold, color: white });
    } else {
      page.drawText(h, { x: colX[i] + 6, y: curY - 15, size: 9, font: fontBold, color: white });
    }
  });
  curY -= tblHeaderH;

  // Linhas da tabela
  for (let i = 0; i < params.employees.length; i++) {
    const e = params.employees[i];
    const rowH = 18;
    ensureSpace(rowH);
    if (i % 2 === 1) {
      page.drawRectangle({ x: marginL, y: curY - rowH, width: maxTextW, height: rowH, color: rgb(0.97, 0.98, 0.98) });
    }
    // Nome
    const nameMaxW = colWidths[0] - 10;
    const nameLines = wrapText(e.userName, font, 8.5, nameMaxW);
    const nameDisplay = nameLines[0] + (nameLines.length > 1 ? "…" : "");
    page.drawText(nameDisplay, { x: colX[0] + 6, y: curY - 12, size: 8.5, font, color: dark });
    // Valores numéricos alinhados à direita
    const drawNum = (i: number, value: string, color: RGB = dark, b = false) => {
      const f = b ? fontBold : font;
      const w = f.widthOfTextAtSize(value, 8.5);
      page.drawText(value, { x: colX[i] + colWidths[i] - w - 4, y: curY - 12, size: 8.5, font: f, color });
    };
    drawNum(1, formatBRL(e.netSalary));
    drawNum(2, formatBRL(e.discountAmount), negativeRed);
    drawNum(3, formatBRL(e.bonusAmount), positiveGreen);
    drawNum(4, formatBRL(e.totalToPay), primary, true);
    curY -= rowH;
  }

  // ============ PÁGINA POR FUNCIONÁRIO ============
  for (const emp of params.employees) {
    page = pdfDoc.addPage([W, H]);
    pageNumber++;
    drawHeader(page);
    curY = contentTop;

    // Nome do funcionário em destaque
    page.drawText(emp.userName, { x: marginL, y: curY, size: 14, font: fontBold, color: primary });
    curY -= 20;
    if (emp.userDepartment || emp.userPosition) {
      const sub = [emp.userPosition, emp.userDepartment].filter(Boolean).join(" · ");
      page.drawText(sub, { x: marginL, y: curY, size: 9, font, color: gray });
      curY -= 16;
    }
    drawSpacer(6);

    drawSectionTitle("Dados Cadastrais");
    drawField("E-mail", emp.userEmail);
    drawField("Vínculo", (emp.userEmploymentType || "-").toUpperCase());

    drawSectionTitle("Remuneração");
    drawField("Salário bruto", formatBRL(emp.grossSalary));
    drawField("Salário líquido", formatBRL(emp.netSalary));
    if (emp.salaryEffectiveFrom) {
      drawField("Vigente desde", formatDateBR(emp.salaryEffectiveFrom + "T12:00:00"));
    }

    drawSectionTitle("Ajustes do Mês (RH)");
    drawField("Desconto", formatBRL(emp.discountAmount), negativeRed);
    drawField("Abono", formatBRL(emp.bonusAmount), positiveGreen);
    drawField("Status do tratamento", TREATMENT_STATUS_LABEL[emp.treatmentStatus] || emp.treatmentStatus);
    if (emp.decisionAt) drawField("Decisão em", formatDateBR(emp.decisionAt));

    // Caixa de total a pagar
    drawSpacer(10);
    ensureSpace(50);
    page.drawRectangle({ x: marginL, y: curY - 40, width: maxTextW, height: 40, color: primary });
    page.drawText("TOTAL A PAGAR", { x: marginL + 15, y: curY - 18, size: 10, font: fontBold, color: white });
    const totalStr = formatBRL(emp.totalToPay);
    const totalW = fontBold.widthOfTextAtSize(totalStr, 18);
    page.drawText(totalStr, { x: W - marginR - 15 - totalW, y: curY - 27, size: 18, font: fontBold, color: white });
    curY -= 55;

    // Observações do RH
    if (emp.treatmentNotes) {
      drawSectionTitle("Observações do RH");
      drawParagraph(emp.treatmentNotes, 9, dark);
    }

    // Pontos do mês
    if (emp.punches.length > 0) {
      drawSectionTitle(`Pontos Batidos no Mês (${emp.punches.length})`);
      // Agrupar por dia
      const byDay: Record<string, typeof emp.punches> = {};
      for (const p of emp.punches) {
        const day = new Date(p.timestamp).toISOString().slice(0, 10);
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(p);
      }
      for (const [day, recs] of Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))) {
        ensureSpace(14);
        const dateLabel = formatDateBR(day + "T12:00:00");
        page.drawText(dateLabel, { x: marginL, y: curY, size: 8.5, font: fontBold, color: gray });
        const dateW = fontBold.widthOfTextAtSize(dateLabel, 8.5);
        const timesStr = recs.map(r => `${PUNCH_LABEL[r.type] || r.type} ${formatTimeBR(r.timestamp)}`).join(" · ");
        const lines = wrapText(timesStr, font, 8.5, maxTextW - dateW - 12);
        page.drawText(lines[0] || "", { x: marginL + dateW + 10, y: curY, size: 8.5, font, color: dark });
        curY -= 13;
        for (let i = 1; i < lines.length; i++) {
          ensureSpace(13);
          page.drawText(lines[i], { x: marginL + dateW + 10, y: curY, size: 8.5, font, color: dark });
          curY -= 13;
        }
      }
    }

    // Ajustes do mês
    if (emp.adjustments.length > 0) {
      drawSectionTitle(`Ajustes Solicitados no Mês (${emp.adjustments.length})`);
      for (const adj of emp.adjustments) {
        ensureSpace(30);
        const head = `${PUNCH_LABEL[adj.requestedType] || adj.requestedType} · ${formatDateBR(adj.requestedTimestamp)} ${formatTimeBR(adj.requestedTimestamp)}`;
        page.drawText(head, { x: marginL, y: curY, size: 8.5, font: fontBold, color: dark });
        const statusText = `[${ADJ_STATUS_LABEL[adj.status] || adj.status}]`;
        const statusW = fontBold.widthOfTextAtSize(statusText, 8);
        const statusColor = adj.status === "aprovado" ? positiveGreen : adj.status === "rejeitado" ? negativeRed : gray;
        page.drawText(statusText, { x: W - marginR - statusW, y: curY, size: 8, font: fontBold, color: statusColor });
        curY -= 13;
        const reasonLines = wrapText(`Motivo: ${adj.reason}`, font, 8, maxTextW);
        for (const line of reasonLines) {
          ensureSpace(12);
          page.drawText(line, { x: marginL + 10, y: curY, size: 8, font, color: gray });
          curY -= 12;
        }
        if (adj.reviewNotes) {
          const rhLines = wrapText(`Obs. RH: ${adj.reviewNotes}`, font, 8, maxTextW);
          for (const line of rhLines) {
            ensureSpace(12);
            page.drawText(line, { x: marginL + 10, y: curY, size: 8, font, color: gray });
            curY -= 12;
          }
        }
        drawSpacer(4);
      }
    }
  }

  // ============ PÁGINA DE ENCERRAMENTO / ASSINATURA ============
  page = pdfDoc.addPage([W, H]);
  pageNumber++;
  drawHeader(page);
  curY = contentTop;

  drawSectionTitle("Encerramento");
  drawSpacer(20);

  drawParagraph(
    "Declaro, para os devidos fins, que os registros de ponto, ajustes e valores constantes nesta folha foram conferidos e emitidos em conformidade com os procedimentos internos do CVI — Centro de Vida Independente do Amazonas.",
    9, dark,
  );
  drawSpacer(20);

  drawField("Mês de referência", params.monthLabel);
  drawField("Quantidade de funcionários", String(params.employees.length));
  drawField("Total a pagar (consolidado)", formatBRL(totalPagar), primary);

  drawSpacer(40);

  // Linha de assinatura textual
  ensureSpace(80);
  page.drawRectangle({ x: marginL, y: curY - 3, width: maxTextW, height: 0.8, color: dark });
  curY -= 15;
  const sigName = params.generatedByName;
  const sigNameW = fontBold.widthOfTextAtSize(sigName, 10);
  page.drawText(sigName, { x: (W - sigNameW) / 2, y: curY, size: 10, font: fontBold, color: dark });
  curY -= 14;
  const sigRole = params.generatedByRole;
  const sigRoleW = font.widthOfTextAtSize(sigRole, 8.5);
  page.drawText(sigRole, { x: (W - sigRoleW) / 2, y: curY, size: 8.5, font, color: gray });
  curY -= 14;
  const place = `Manaus/AM, ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Manaus", day: "2-digit", month: "long", year: "numeric" })}`;
  const placeW = font.widthOfTextAtSize(place, 8);
  page.drawText(place, { x: (W - placeW) / 2, y: curY, size: 8, font, color: gray });

  drawFooter(page, pageNumber);

  return await pdfDoc.save();
}
