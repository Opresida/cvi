import { Router } from "express";
import multer from "multer";
import { db } from "../db";
import { paystubs, users, fileStorage } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";
import { saveFile, loadFile, deleteFile, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "../utils/fileStorage";

const router = Router();
router.use(authMiddleware);

const MONTH_REGEX = /^\d{4}-\d{2}$/;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    // Contracheque é sempre PDF — rejeita imagens
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error(`Apenas arquivos PDF são aceitos para contracheques`));
  },
});

function monthToFirstDay(month: string): string {
  return `${month}-01`;
}

// GET /api/paystubs — admin vê todos (opcional ?month=YYYY-MM); funcionário só os próprios
router.get("/", async (req: AuthRequest, res) => {
  try {
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";
    const month = req.query.month as string | undefined;

    const conditions = [];
    if (month) {
      if (!MONTH_REGEX.test(month)) return res.status(400).json({ error: "Formato de mês inválido (use YYYY-MM)" });
      conditions.push(eq(paystubs.referenceMonth, monthToFirstDay(month)));
    }
    if (!isStaff) {
      conditions.push(eq(paystubs.userId, req.user!.userId));
    }

    const base = db
      .select({
        id: paystubs.id,
        userId: paystubs.userId,
        userName: users.name,
        userDepartment: users.department,
        referenceMonth: paystubs.referenceMonth,
        fileId: paystubs.fileId,
        fileName: fileStorage.filename,
        fileSizeBytes: fileStorage.sizeBytes,
        notes: paystubs.notes,
        uploadedBy: paystubs.uploadedBy,
        uploadedAt: paystubs.uploadedAt,
      })
      .from(paystubs)
      .innerJoin(users, eq(paystubs.userId, users.id))
      .innerJoin(fileStorage, eq(paystubs.fileId, fileStorage.id));

    const records = conditions.length
      ? await base.where(and(...conditions)).orderBy(desc(paystubs.referenceMonth), users.name)
      : await base.orderBy(desc(paystubs.referenceMonth), users.name);

    return res.json({ paystubs: records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao listar contracheques:`, err);
    return res.status(500).json({ error: "Erro ao listar contracheques", errorId });
  }
});

// Error handler para o multer (MIME type inválido / arquivo grande demais)
const handleUploadError = (err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: `Arquivo excede o limite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB` });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message || "Erro no upload" });
  next();
};

// POST /api/paystubs — admin faz upload (multipart: file + userId + month + notes)
router.post("/", gestorOrAdmin, upload.single("file"), handleUploadError, async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Arquivo PDF obrigatório no campo 'file'" });

    const { userId, month, notes } = req.body;
    if (!userId || !month) {
      return res.status(400).json({ error: "userId e month são obrigatórios" });
    }
    const uid = parseInt(userId);
    if (isNaN(uid) || uid <= 0) return res.status(400).json({ error: "userId inválido" });
    if (!MONTH_REGEX.test(month)) return res.status(400).json({ error: "Formato de mês inválido (use YYYY-MM)" });

    const refMonth = monthToFirstDay(month);

    // Confirma funcionário
    const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, uid)).limit(1);
    if (!target) return res.status(404).json({ error: "Funcionário não encontrado" });

    // Se já existe contracheque pra esse mês/funcionário: substituir (delete file antigo + update)
    const [existing] = await db
      .select()
      .from(paystubs)
      .where(and(eq(paystubs.userId, uid), eq(paystubs.referenceMonth, refMonth)))
      .limit(1);

    // Upload do PDF
    const saved = await saveFile({
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      data: req.file.buffer,
      uploadedBy: req.user!.userId,
    });

    const sanitizedNotes = notes ? sanitizeHtml(String(notes).slice(0, 500)) : null;

    if (existing) {
      // Atualizar registro + apagar arquivo antigo
      const oldFileId = existing.fileId;
      const [updated] = await db
        .update(paystubs)
        .set({
          fileId: saved.id,
          notes: sanitizedNotes,
          uploadedBy: req.user!.userId,
          uploadedAt: new Date(),
        })
        .where(eq(paystubs.id, existing.id))
        .returning();
      // Limpar arquivo antigo (não é crítico se falhar)
      deleteFile(oldFileId).catch((err) => console.warn("Falha ao limpar arquivo antigo:", err));
      return res.json({ paystub: updated, action: "replaced" });
    }

    const [created] = await db
      .insert(paystubs)
      .values({
        userId: uid,
        referenceMonth: refMonth,
        fileId: saved.id,
        notes: sanitizedNotes,
        uploadedBy: req.user!.userId,
      })
      .returning();

    return res.status(201).json({ paystub: created, action: "created" });
  } catch (err: any) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao enviar contracheque:`, err);
    return res.status(500).json({ error: err?.message || "Erro ao enviar contracheque", errorId });
  }
});

// GET /api/paystubs/:id/download — baixa o PDF (dono ou admin)
router.get("/:id/download", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [stub] = await db.select().from(paystubs).where(eq(paystubs.id, id)).limit(1);
    if (!stub) return res.status(404).json({ error: "Contracheque não encontrado" });

    const isOwner = stub.userId === req.user!.userId;
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";
    if (!isOwner && !isStaff) return res.status(403).json({ error: "Sem permissão" });

    const file = await loadFile(stub.fileId);
    if (!file) return res.status(404).json({ error: "Arquivo não encontrado" });

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.filename)}"`);
    return res.send(file.data);
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao baixar contracheque:`, err);
    return res.status(500).json({ error: "Erro ao baixar contracheque", errorId });
  }
});

// DELETE /api/paystubs/:id — admin remove (apaga registro + arquivo)
router.delete("/:id", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [stub] = await db.select().from(paystubs).where(eq(paystubs.id, id)).limit(1);
    if (!stub) return res.status(404).json({ error: "Contracheque não encontrado" });

    const fileId = stub.fileId;
    await db.delete(paystubs).where(eq(paystubs.id, id));
    deleteFile(fileId).catch((err) => console.warn("Falha ao limpar arquivo:", err));

    return res.json({ message: "Contracheque removido" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao remover contracheque:`, err);
    return res.status(500).json({ error: "Erro ao remover contracheque", errorId });
  }
});

export default router;
