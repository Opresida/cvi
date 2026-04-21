import { Router } from "express";
import { db } from "../db";
import { punchAdjustments, punchRecords, users } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { sanitizeHtml } from "../utils/sanitize";

const router = Router();
router.use(authMiddleware);

const VALID_TYPES = ["entrada", "saida_almoco", "volta_almoco", "saida"];

// POST /api/adjustments
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { punchRecordId, requestedType, requestedTimestamp, reason, attachmentUrl } = req.body;

    if (!requestedType || !requestedTimestamp || !reason) {
      return res.status(400).json({ error: "Tipo, horário e motivo são obrigatórios" });
    }

    if (!VALID_TYPES.includes(requestedType)) {
      return res.status(400).json({ error: "Tipo de ponto inválido" });
    }

    // LOW FIX #14: validação de timestamp
    const timestamp = new Date(requestedTimestamp);
    if (isNaN(timestamp.getTime())) {
      return res.status(400).json({ error: "Data/hora inválida" });
    }

    // Não permitir ajustes para datas futuras
    if (timestamp > new Date()) {
      return res.status(400).json({ error: "Não é possível solicitar ajuste para data futura" });
    }

    if (reason.trim().length < 5) {
      return res.status(400).json({ error: "Motivo deve ter no mínimo 5 caracteres" });
    }

    // LOW FIX #15: validação de URL do anexo
    if (attachmentUrl) {
      try {
        new URL(attachmentUrl);
      } catch {
        return res.status(400).json({ error: "URL de anexo inválida" });
      }
      if (attachmentUrl.length > 2048) {
        return res.status(400).json({ error: "URL de anexo muito longa" });
      }
    }

    const [adjustment] = await db
      .insert(punchAdjustments)
      .values({
        userId: req.user!.userId,
        punchRecordId: punchRecordId || null,
        requestedType,
        requestedTimestamp: timestamp,
        reason: sanitizeHtml(reason.trim().slice(0, 1000)),
        attachmentUrl: attachmentUrl || null,
      })
      .returning();

    return res.status(201).json({ adjustment });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao solicitar ajuste:`, err);
    return res.status(500).json({ error: "Erro ao solicitar ajuste", errorId });
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
        reason: punchAdjustments.reason, attachmentUrl: punchAdjustments.attachmentUrl,
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

    // HIGH FIX #6: verificar se ainda está pendente (anti race condition)
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
