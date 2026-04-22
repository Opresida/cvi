import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";

const router = Router();
router.use(authMiddleware);
router.use(gestorOrAdmin);

// Validadores
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

function validateId(id: string): number | null {
  const n = parseInt(id);
  return isNaN(n) || n <= 0 ? null : n;
}

// GET /api/employees
router.get("/", async (_req, res) => {
  try {
    const employees = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        employmentType: users.employmentType,
        department: users.department,
        position: users.position,
        requiresPunch: users.requiresPunch,
        weeklyHours: users.weeklyHours,
        dailyHours: users.dailyHours,
        workStartTime: users.workStartTime,
        workEndTime: users.workEndTime,
        lunchDurationMinutes: users.lunchDurationMinutes,
        hasLunchBreak: users.hasLunchBreak,
        active: users.active,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.name);

    return res.json({ employees });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao listar funcionários:`, err);
    return res.status(500).json({ error: "Erro ao listar funcionários", errorId });
  }
});

// POST /api/employees
router.post("/", async (req, res) => {
  try {
    const {
      name, email, password, role, employmentType,
      department, position, requiresPunch,
      weeklyHours, dailyHours, workStartTime, workEndTime,
      lunchDurationMinutes, hasLunchBreak,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }

    // MEDIUM FIX #11: validação de email
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Formato de e-mail inválido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }

    // LOW FIX #17: validação de horários
    if (workStartTime && !TIME_REGEX.test(workStartTime)) {
      return res.status(400).json({ error: "Hora de início inválida (use HH:MM)" });
    }
    if (workEndTime && !TIME_REGEX.test(workEndTime)) {
      return res.status(400).json({ error: "Hora de saída inválida (use HH:MM)" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [employee] = await db.insert(users).values({
      name: sanitizeHtml(name.trim()),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "funcionario",
      employmentType: employmentType || "clt",
      department: department ? sanitizeHtml(department) : null,
      position: position ? sanitizeHtml(position) : null,
      requiresPunch: requiresPunch ?? true,
      weeklyHours: weeklyHours || 44,
      dailyHours: dailyHours || 8,
      workStartTime: workStartTime || "08:00",
      workEndTime: workEndTime || "17:00",
      lunchDurationMinutes: lunchDurationMinutes || 60,
      hasLunchBreak: hasLunchBreak ?? true,
    }).returning();

    return res.status(201).json({
      employee: { ...employee, password: undefined },
    });
  } catch (err: any) {
    // CRITICAL FIX #3: detecção robusta de unique constraint (PostgreSQL code 23505)
    const dbErr = err.sourceError || err.cause || err;
    if (String(dbErr.code) === "23505" || dbErr.constraint || String(err.code) === "23505" || err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao cadastrar funcionário:`, err);
    return res.status(500).json({ error: "Erro ao cadastrar funcionário", errorId });
  }
});

// PUT /api/employees/:id
router.put("/:id", async (req, res) => {
  try {
    // MEDIUM FIX #9: validação de ID
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    const updates: Record<string, any> = { updatedAt: new Date() };

    const allowedFields = [
      "name", "email", "role", "employmentType", "department", "position",
      "requiresPunch", "weeklyHours", "dailyHours", "workStartTime", "workEndTime",
      "lunchDurationMinutes", "hasLunchBreak", "active",
    ];

    const textFields = ["name", "department", "position"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = textFields.includes(field) && typeof req.body[field] === "string"
          ? sanitizeHtml(req.body[field])
          : req.body[field];
      }
    }

    // Validações dos campos editáveis
    if (updates.email && !EMAIL_REGEX.test(updates.email)) {
      return res.status(400).json({ error: "Formato de e-mail inválido" });
    }
    if (updates.workStartTime && !TIME_REGEX.test(updates.workStartTime)) {
      return res.status(400).json({ error: "Hora de início inválida (use HH:MM)" });
    }
    if (updates.workEndTime && !TIME_REGEX.test(updates.workEndTime)) {
      return res.status(400).json({ error: "Hora de saída inválida (use HH:MM)" });
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      }
      updates.password = await bcrypt.hash(req.body.password, 12);
    }

    const [employee] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    if (!employee) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    return res.json({ employee: { ...employee, password: undefined } });
  } catch (err: any) {
    const dbErr = err.sourceError || err.cause || err;
    if (String(dbErr.code) === "23505" || dbErr.constraint || String(err.code) === "23505" || err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao atualizar funcionário:`, err);
    return res.status(500).json({ error: "Erro ao atualizar funcionário", errorId });
  }
});

// DELETE /api/employees/:id (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    // LOW FIX #16: verificar existência
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    await db.update(users).set({ active: false, updatedAt: new Date() }).where(eq(users.id, id));
    return res.json({ message: "Funcionário desativado" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao desativar funcionário:`, err);
    return res.status(500).json({ error: "Erro ao desativar funcionário", errorId });
  }
});

export default router;
