import { Router } from "express";
import multer from "multer";
import { db } from "../db";
import { vacations, users } from "../db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";
import { saveFile, loadFile, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "../utils/fileStorage";

const router = Router();
router.use(authMiddleware);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  },
});

function diffInDays(start: string, end: string): number {
  const s = new Date(start + "T00:00:00Z").getTime();
  const e = new Date(end + "T00:00:00Z").getTime();
  return Math.round((e - s) / 86400000) + 1; // inclusive
}

// GET /api/vacations — admin vê todas; funcionário vê só as próprias
router.get("/", async (req: AuthRequest, res) => {
  try {
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";

    const base = db
      .select({
        id: vacations.id,
        userId: vacations.userId,
        userName: users.name,
        userDepartment: users.department,
        startDate: vacations.startDate,
        endDate: vacations.endDate,
        status: vacations.status,
        noticeFileId: vacations.noticeFileId,
        acknowledgedAt: vacations.acknowledgedAt,
        notes: vacations.notes,
        createdBy: vacations.createdBy,
        createdAt: vacations.createdAt,
      })
      .from(vacations)
      .innerJoin(users, eq(vacations.userId, users.id));

    const records = isStaff
      ? await base.orderBy(desc(vacations.startDate))
      : await base.where(eq(vacations.userId, req.user!.userId)).orderBy(desc(vacations.startDate));

    return res.json({ vacations: records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao listar férias:`, err);
    return res.status(500).json({ error: "Erro ao listar férias", errorId });
  }
});

// POST /api/vacations — admin agenda férias (opcional: já anexa o aviso)
router.post("/", gestorOrAdmin, upload.single("notice"), async (req: AuthRequest, res) => {
  try {
    const { userId, startDate, endDate, notes } = req.body;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: "Funcionário, data início e data fim são obrigatórios" });
    }
    const uid = parseInt(userId);
    if (isNaN(uid) || uid <= 0) return res.status(400).json({ error: "ID de funcionário inválido" });

    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
      return res.status(400).json({ error: "Formato de data inválido (use YYYY-MM-DD)" });
    }
    if (startDate > endDate) {
      return res.status(400).json({ error: "Data início deve ser anterior ou igual à data fim" });
    }

    const days = diffInDays(startDate, endDate);
    if (days !== 30) {
      return res.status(400).json({ error: `Período de férias deve ter 30 dias (foi informado ${days})` });
    }

    // Bloquear sobreposição com férias existentes do mesmo funcionário
    const overlapping = await db
      .select({ id: vacations.id, startDate: vacations.startDate, endDate: vacations.endDate })
      .from(vacations)
      .where(and(
        eq(vacations.userId, uid),
        inArray(vacations.status, ["agendada", "em_curso"]),
      ));
    const overlap = overlapping.find((v) => !(v.endDate < startDate || v.startDate > endDate));
    if (overlap) {
      return res.status(409).json({
        error: `Já existe férias agendada para este funcionário entre ${overlap.startDate} e ${overlap.endDate}`,
      });
    }

    // Confirma que o user existe
    const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, uid)).limit(1);
    if (!target) return res.status(404).json({ error: "Funcionário não encontrado" });

    // Upload opcional do aviso
    let noticeFileId: number | null = null;
    if (req.file) {
      const saved = await saveFile({
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        data: req.file.buffer,
        uploadedBy: req.user!.userId,
      });
      noticeFileId = saved.id;
    }

    const [record] = await db
      .insert(vacations)
      .values({
        userId: uid,
        startDate,
        endDate,
        status: "agendada",
        noticeFileId,
        notes: notes ? sanitizeHtml(String(notes).slice(0, 500)) : null,
        createdBy: req.user!.userId,
      })
      .returning();

    return res.status(201).json({ vacation: record });
  } catch (err: any) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao agendar férias:`, err);
    return res.status(500).json({ error: err?.message || "Erro ao agendar férias", errorId });
  }
});

// PUT /api/vacations/:id — admin altera status/notes
router.put("/:id", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (req.body.status) {
      if (!["agendada", "em_curso", "concluida", "cancelada"].includes(req.body.status)) {
        return res.status(400).json({ error: "Status inválido" });
      }
      updates.status = req.body.status;
    }
    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes ? sanitizeHtml(String(req.body.notes).slice(0, 500)) : null;
    }

    const [updated] = await db.update(vacations).set(updates).where(eq(vacations.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Férias não encontradas" });
    return res.json({ vacation: updated });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao atualizar férias:`, err);
    return res.status(500).json({ error: "Erro ao atualizar férias", errorId });
  }
});

// POST /api/vacations/:id/notice — admin anexa (ou substitui) aviso
router.post("/:id/notice", gestorOrAdmin, upload.single("notice"), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });
    if (!req.file) return res.status(400).json({ error: "Arquivo obrigatório" });

    const [existing] = await db.select({ id: vacations.id }).from(vacations).where(eq(vacations.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Férias não encontradas" });

    const saved = await saveFile({
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      data: req.file.buffer,
      uploadedBy: req.user!.userId,
    });

    const [updated] = await db
      .update(vacations)
      .set({ noticeFileId: saved.id, updatedAt: new Date() })
      .where(eq(vacations.id, id))
      .returning();

    return res.json({ vacation: updated });
  } catch (err: any) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao anexar aviso:`, err);
    return res.status(500).json({ error: err?.message || "Erro ao anexar aviso", errorId });
  }
});

// GET /api/vacations/:id/notice — baixa o aviso (dono ou admin)
router.get("/:id/notice", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [vac] = await db
      .select({ userId: vacations.userId, noticeFileId: vacations.noticeFileId })
      .from(vacations)
      .where(eq(vacations.id, id))
      .limit(1);

    if (!vac) return res.status(404).json({ error: "Férias não encontradas" });
    if (!vac.noticeFileId) return res.status(404).json({ error: "Sem aviso anexado" });

    const isOwner = vac.userId === req.user!.userId;
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";
    if (!isOwner && !isStaff) return res.status(403).json({ error: "Sem permissão" });

    const file = await loadFile(vac.noticeFileId);
    if (!file) return res.status(404).json({ error: "Arquivo não encontrado" });

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.filename)}"`);
    return res.send(file.data);
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao baixar aviso:`, err);
    return res.status(500).json({ error: "Erro ao baixar aviso", errorId });
  }
});

// POST /api/vacations/:id/acknowledge — funcionário confirma ciência do aviso
router.post("/:id/acknowledge", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [vac] = await db.select().from(vacations).where(eq(vacations.id, id)).limit(1);
    if (!vac) return res.status(404).json({ error: "Férias não encontradas" });
    if (vac.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Só o próprio funcionário pode confirmar ciência" });
    }
    if (vac.acknowledgedAt) {
      return res.status(409).json({ error: "Ciência já confirmada" });
    }

    const [updated] = await db
      .update(vacations)
      .set({ acknowledgedAt: new Date(), updatedAt: new Date() })
      .where(eq(vacations.id, id))
      .returning();

    return res.json({ vacation: updated });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro acknowledge:`, err);
    return res.status(500).json({ error: "Erro ao confirmar ciência", errorId });
  }
});

// DELETE /api/vacations/:id — admin cancela (hard delete se ainda não começou)
router.delete("/:id", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const deleted = await db.delete(vacations).where(eq(vacations.id, id)).returning({ id: vacations.id });
    if (deleted.length === 0) return res.status(404).json({ error: "Férias não encontradas" });
    return res.json({ message: "Férias removidas" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao remover férias:`, err);
    return res.status(500).json({ error: "Erro ao remover férias", errorId });
  }
});

export default router;
