import { Router } from "express";
import { db } from "../db";
import { salaryHistory, users } from "../db/schema";
import { eq, desc, and, lte } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";

const router = Router();
router.use(authMiddleware);

// Valida formato ISO date (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function canAccess(req: AuthRequest, targetUserId: number): boolean {
  if (req.user!.userId === targetUserId) return true;
  return req.user!.role === "admin" || req.user!.role === "gestor";
}

// GET /api/salary/:userId/current — retorna salário vigente
router.get("/:userId/current", async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) return res.status(400).json({ error: "ID inválido" });
    if (!canAccess(req, userId)) return res.status(403).json({ error: "Sem permissão" });

    const today = new Date().toISOString().slice(0, 10);
    const [current] = await db
      .select()
      .from(salaryHistory)
      .where(and(eq(salaryHistory.userId, userId), lte(salaryHistory.effectiveFrom, today)))
      .orderBy(desc(salaryHistory.effectiveFrom))
      .limit(1);

    return res.json({ salary: current || null });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro salário current:`, err);
    return res.status(500).json({ error: "Erro ao buscar salário", errorId });
  }
});

// GET /api/salary/:userId/history — todo o histórico
router.get("/:userId/history", async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) return res.status(400).json({ error: "ID inválido" });
    if (!canAccess(req, userId)) return res.status(403).json({ error: "Sem permissão" });

    const records = await db
      .select()
      .from(salaryHistory)
      .where(eq(salaryHistory.userId, userId))
      .orderBy(desc(salaryHistory.effectiveFrom));

    return res.json({ history: records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro salário history:`, err);
    return res.status(500).json({ error: "Erro ao buscar histórico", errorId });
  }
});

// POST /api/salary/:userId — admin registra novo salário (pode ser aumento, ajuste, primeira definição)
router.post("/:userId", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) return res.status(400).json({ error: "ID inválido" });

    const { grossSalary, netSalary, effectiveFrom, notes } = req.body;

    if (grossSalary === undefined || netSalary === undefined || !effectiveFrom) {
      return res.status(400).json({ error: "grossSalary, netSalary e effectiveFrom são obrigatórios" });
    }

    const gross = parseFloat(grossSalary);
    const net = parseFloat(netSalary);
    if (isNaN(gross) || gross < 0 || isNaN(net) || net < 0) {
      return res.status(400).json({ error: "Valores de salário inválidos" });
    }
    if (net > gross) {
      return res.status(400).json({ error: "Salário líquido não pode ser maior que o bruto" });
    }
    if (!DATE_REGEX.test(effectiveFrom)) {
      return res.status(400).json({ error: "Data inválida (use YYYY-MM-DD)" });
    }

    // Confirma que o user existe
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (!existingUser) return res.status(404).json({ error: "Funcionário não encontrado" });

    const [record] = await db
      .insert(salaryHistory)
      .values({
        userId,
        grossSalary: gross.toFixed(2),
        netSalary: net.toFixed(2),
        effectiveFrom,
        notes: notes ? sanitizeHtml(String(notes).slice(0, 500)) : null,
        createdBy: req.user!.userId,
      })
      .returning();

    return res.status(201).json({ salary: record });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao registrar salário:`, err);
    return res.status(500).json({ error: "Erro ao registrar salário", errorId });
  }
});

// DELETE /api/salary/entry/:id — admin remove um registro específico (correção de erro de digitação, etc)
router.delete("/entry/:id", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const deleted = await db.delete(salaryHistory).where(eq(salaryHistory.id, id)).returning({ id: salaryHistory.id });
    if (deleted.length === 0) return res.status(404).json({ error: "Registro não encontrado" });

    return res.json({ message: "Registro removido" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao remover salário:`, err);
    return res.status(500).json({ error: "Erro ao remover registro", errorId });
  }
});

export default router;
