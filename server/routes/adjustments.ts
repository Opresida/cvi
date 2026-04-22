import { Router } from "express";
import multer from "multer";
import { db } from "../db";
import { punchAdjustments, punchRecords, users } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";
import { saveFile, loadFile, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "../utils/fileStorage";

const router = Router();
router.use(authMiddleware);

const VALID_TYPES = ["entrada", "saida_almoco", "volta_almoco", "saida"];

// Multer — storage em memória (arquivo vai direto pro bytea do Postgres)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  },
});

// POST /api/adjustments — aceita multipart com campo opcional "attachment"
router.post("/", upload.single("attachment"), async (req: AuthRequest, res) => {
  try {
    const { punchRecordId, requestedType, requestedTimestamp, reason } = req.body;

    if (!requestedType || !requestedTimestamp || !reason) {
      return res.status(400).json({ error: "Tipo, horário e motivo são obrigatórios" });
    }

    if (!VALID_TYPES.includes(requestedType)) {
      return res.status(400).json({ error: "Tipo de ponto inválido" });
    }

    const timestamp = new Date(requestedTimestamp);
    if (isNaN(timestamp.getTime())) {
      return res.status(400).json({ error: "Data/hora inválida" });
    }

    if (timestamp > new Date()) {
      return res.status(400).json({ error: "Não é possível solicitar ajuste para data futura" });
    }

    if (reason.trim().length < 5) {
      return res.status(400).json({ error: "Motivo deve ter no mínimo 5 caracteres" });
    }

    // Upload do anexo (se houver)
    let attachmentFileId: number | null = null;
    if (req.file) {
      const saved = await saveFile({
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        data: req.file.buffer,
        uploadedBy: req.user!.userId,
      });
      attachmentFileId = saved.id;
    }

    const [adjustment] = await db
      .insert(punchAdjustments)
      .values({
        userId: req.user!.userId,
        punchRecordId: punchRecordId ? parseInt(punchRecordId) : null,
        requestedType,
        requestedTimestamp: timestamp,
        reason: sanitizeHtml(reason.trim().slice(0, 1000)),
        attachmentFileId,
      })
      .returning();

    return res.status(201).json({ adjustment });
  } catch (err: any) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao solicitar ajuste:`, err);
    return res.status(500).json({ error: err?.message || "Erro ao solicitar ajuste", errorId });
  }
});

// GET /api/adjustments/mine
router.get("/mine", async (req: AuthRequest, res) => {
  try {
    const adjustments = await db
      .select()
      .from(punchAdjustments)
      .where(eq(punchAdjustments.userId, req.user!.userId))
      .orderBy(desc(punchAdjustments.createdAt));

    return res.json({ adjustments });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro:`, err);
    return res.status(500).json({ error: "Erro ao buscar ajustes", errorId });
  }
});

// GET /api/adjustments/pending (admin/gestor)
router.get("/pending", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const adjustments = await db
      .select({
        id: punchAdjustments.id, userId: punchAdjustments.userId,
        userName: users.name, userEmail: users.email,
        punchRecordId: punchAdjustments.punchRecordId,
        requestedType: punchAdjustments.requestedType,
        requestedTimestamp: punchAdjustments.requestedTimestamp,
        reason: punchAdjustments.reason,
        attachmentFileId: punchAdjustments.attachmentFileId,
        status: punchAdjustments.status, createdAt: punchAdjustments.createdAt,
      })
      .from(punchAdjustments)
      .innerJoin(users, eq(punchAdjustments.userId, users.id))
      .where(eq(punchAdjustments.status, "pendente"))
      .orderBy(desc(punchAdjustments.createdAt));

    return res.json({ adjustments });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro:`, err);
    return res.status(500).json({ error: "Erro ao buscar ajustes pendentes", errorId });
  }
});

// GET /api/adjustments/:id/attachment — baixa o anexo (autor do ajuste OU admin/gestor)
router.get("/:id/attachment", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const [adj] = await db
      .select({ userId: punchAdjustments.userId, fileId: punchAdjustments.attachmentFileId })
      .from(punchAdjustments)
      .where(eq(punchAdjustments.id, id))
      .limit(1);

    if (!adj) return res.status(404).json({ error: "Ajuste não encontrado" });
    if (!adj.fileId) return res.status(404).json({ error: "Este ajuste não tem anexo" });

    // Autorização: dono do ajuste OU admin/gestor
    const isOwner = adj.userId === req.user!.userId;
    const isStaff = req.user!.role === "admin" || req.user!.role === "gestor";
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Sem permissão para acessar este anexo" });
    }

    const file = await loadFile(adj.fileId);
    if (!file) return res.status(404).json({ error: "Arquivo não encontrado" });

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.filename)}"`);
    return res.send(file.data);
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao baixar anexo:`, err);
    return res.status(500).json({ error: "Erro ao baixar anexo", errorId });
  }
});

// PUT /api/adjustments/:id/review (admin/gestor)
router.put("/:id/review", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { status, reviewNotes } = req.body;
    if (!status || !["aprovado", "rejeitado"].includes(status)) {
      return res.status(400).json({ error: "Status deve ser 'aprovado' ou 'rejeitado'" });
    }

    const [existing] = await db
      .select()
      .from(punchAdjustments)
      .where(eq(punchAdjustments.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Ajuste não encontrado" });
    }

    if (existing.status !== "pendente") {
      return res.status(409).json({ error: "Este ajuste já foi processado" });
    }

    const [adjustment] = await db
      .update(punchAdjustments)
      .set({
        status,
        reviewedBy: req.user!.userId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes?.slice(0, 500) || null,
      })
      .where(eq(punchAdjustments.id, id))
      .returning();

    if (status === "aprovado") {
      await db.insert(punchRecords).values({
        userId: adjustment.userId,
        type: adjustment.requestedType,
        timestamp: adjustment.requestedTimestamp,
        status: "ajustado",
        notes: `Ajuste #${adjustment.id} aprovado. Motivo: ${existing.reason}`,
      });

      if (adjustment.punchRecordId) {
        await db
          .update(punchRecords)
          .set({ status: "ajuste_pendente", notes: `Substituído pelo ajuste #${adjustment.id}` })
          .where(eq(punchRecords.id, adjustment.punchRecordId));
      }
    }

    return res.json({ adjustment });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao revisar ajuste:`, err);
    return res.status(500).json({ error: "Erro ao revisar ajuste", errorId });
  }
});

export default router;
