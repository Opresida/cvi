import { Router } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { createSession, getSession, completeSession } from "../utils/faceSessions";

const router = Router();

// ROTA PÚBLICA — acessada pelo celular via QR code (sem auth)
// Precisa ficar ANTES do middleware de auth

// POST /api/face/mobile/:id — celular envia o resultado (SEM AUTH)
router.post("/mobile/:id", async (req, res) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Sessão expirada ou não encontrada" });
    }

    if (session.status !== "pending") {
      return res.status(409).json({ error: "Sessão já foi completada" });
    }

    const { descriptor } = req.body;
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: "Descriptor deve ser array de 128 números" });
    }

    if (session.purpose === "register") {
      if (!session.userId) {
        return res.status(400).json({ error: "Sessão sem userId" });
      }
      await db
        .update(users)
        .set({
          faceDescriptor: JSON.stringify(descriptor),
          faceRegisteredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));

      completeSession(req.params.id, { descriptor });
      return res.json({ message: "Rosto cadastrado com sucesso" });
    } else {
      const usersWithFace = await db
        .select({ id: users.id, name: users.name, faceDescriptor: users.faceDescriptor })
        .from(users)
        .where(isNotNull(users.faceDescriptor));

      let bestMatch: { id: number; name: string; distance: number } | null = null;
      for (const u of usersWithFace) {
        const stored = JSON.parse(u.faceDescriptor!) as number[];
        const distance = euclideanDistance(descriptor, stored);
        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = { id: u.id, name: u.name, distance };
        }
      }

      const THRESHOLD = 0.6;
      const matched = bestMatch && bestMatch.distance < THRESHOLD;
      const result = {
        descriptor,
        match: !!matched,
        matchedUserId: matched ? bestMatch!.id : undefined,
        matchedUserName: matched ? bestMatch!.name : undefined,
        confidence: matched ? Math.round((1 - bestMatch!.distance / THRESHOLD) * 100) : 0,
      };

      completeSession(req.params.id, result);
      return res.json({ match: result.match, confidence: result.confidence, userName: result.matchedUserName });
    }
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao completar sessão:`, err);
    return res.status(500).json({ error: "Erro ao processar", errorId });
  }
});

// === ROTAS PROTEGIDAS (requerem autenticação) ===

// POST /api/face/register — cadastrar embedding facial de um funcionário
router.post("/register", authMiddleware, gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId, descriptor } = req.body;

    if (!userId || !descriptor) {
      return res.status(400).json({ error: "userId e descriptor são obrigatórios" });
    }

    // Validar que descriptor é array de 128 números
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: "Descriptor deve ser array de 128 números" });
    }

    if (!descriptor.every((n: any) => typeof n === "number" && isFinite(n))) {
      return res.status(400).json({ error: "Descriptor contém valores inválidos" });
    }

    const [user] = await db
      .update(users)
      .set({
        faceDescriptor: JSON.stringify(descriptor),
        faceRegisteredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    return res.json({ message: "Rosto cadastrado com sucesso", userId: user.id });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao cadastrar rosto:`, err);
    return res.status(500).json({ error: "Erro ao cadastrar rosto", errorId });
  }
});

// POST /api/face/verify — verificar rosto contra todos os embeddings cadastrados
router.post("/verify", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { descriptor } = req.body;

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: "Descriptor deve ser array de 128 números" });
    }

    // Buscar todos os usuários com rosto cadastrado
    const usersWithFace = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        faceDescriptor: users.faceDescriptor,
      })
      .from(users)
      .where(isNotNull(users.faceDescriptor));

    if (usersWithFace.length === 0) {
      return res.status(404).json({ error: "Nenhum rosto cadastrado no sistema" });
    }

    // Calcular distância euclidiana contra cada embedding
    let bestMatch: { id: number; name: string; email: string; distance: number } | null = null;

    for (const u of usersWithFace) {
      const stored = JSON.parse(u.faceDescriptor!) as number[];
      const distance = euclideanDistance(descriptor, stored);

      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { id: u.id, name: u.name, email: u.email, distance };
      }
    }

    // Threshold: distância < 0.6 = match (padrão face-api.js)
    const THRESHOLD = 0.6;

    if (bestMatch && bestMatch.distance < THRESHOLD) {
      return res.json({
        match: true,
        confidence: Math.round((1 - bestMatch.distance / THRESHOLD) * 100),
        user: { id: bestMatch.id, name: bestMatch.name, email: bestMatch.email },
        distance: Math.round(bestMatch.distance * 1000) / 1000,
      });
    }

    return res.json({
      match: false,
      confidence: 0,
      distance: bestMatch ? Math.round(bestMatch.distance * 1000) / 1000 : null,
      message: "Rosto não reconhecido",
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao verificar rosto:`, err);
    return res.status(500).json({ error: "Erro ao verificar rosto", errorId });
  }
});

// DELETE /api/face/:userId — remover embedding facial (admin)
router.delete("/:userId", authMiddleware, gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await db
      .update(users)
      .set({ faceDescriptor: null, faceRegisteredAt: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return res.json({ message: "Rosto removido" });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao remover rosto:`, err);
    return res.status(500).json({ error: "Erro ao remover rosto", errorId });
  }
});

// GET /api/face/status — quem tem rosto cadastrado
router.get("/status", authMiddleware, gestorOrAdmin, async (_req: AuthRequest, res) => {
  try {
    const all = await db
      .select({
        id: users.id,
        name: users.name,
        hasFace: users.faceDescriptor,
        faceRegisteredAt: users.faceRegisteredAt,
        active: users.active,
      })
      .from(users)
      .orderBy(users.name);

    const result = all.map((u) => ({
      id: u.id,
      name: u.name,
      hasFace: !!u.hasFace,
      faceRegisteredAt: u.faceRegisteredAt,
      active: u.active,
    }));

    return res.json({
      total: result.length,
      withFace: result.filter((u) => u.hasFace).length,
      users: result,
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro:`, err);
    return res.status(500).json({ error: "Erro ao buscar status", errorId });
  }
});

// ============================================
// SESSÕES QR CODE (para celular)
// ============================================

// POST /api/face/session — criar sessão temporária (gera QR)
router.post("/qr-session", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { purpose, userId } = req.body;

    if (!purpose || !["register", "verify"].includes(purpose)) {
      return res.status(400).json({ error: "Purpose deve ser 'register' ou 'verify'" });
    }

    if (purpose === "register") {
      // Só admin/gestor pode registrar rostos
      const [requester] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
      if (!requester || !["admin", "gestor"].includes(requester.role)) {
        return res.status(403).json({ error: "Sem permissão para cadastrar rostos" });
      }
      if (!userId) {
        return res.status(400).json({ error: "userId obrigatório para cadastro" });
      }
    }

    const session = createSession(purpose, req.user!.userId, userId);

    return res.json({
      sessionId: session.id,
      expiresAt: session.expiresAt,
      purpose: session.purpose,
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao criar sessão:`, err);
    return res.status(500).json({ error: "Erro ao criar sessão", errorId });
  }
});

// GET /api/face/session/:id — polling do status (computador verifica)
router.get("/qr-session/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Sessão expirada ou não encontrada" });
    }

    return res.json({
      status: session.status,
      purpose: session.purpose,
      result: session.status === "completed" ? session.result : undefined,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar sessão" });
  }
});

// Distância euclidiana entre dois vetores
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export default router;
