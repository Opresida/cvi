import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, generateToken, generateErrorId, type AuthRequest } from "../middleware/auth";
import { blacklistToken } from "../utils/tokenBlacklist";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user || !user.active) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    // CRITICAL FIX #2: token retornado no body para o frontend armazenar em localStorage
    // (necessário porque frontend e backend estão em domínios/portas diferentes)
    // Em produção com mesmo domínio, remover token do body e usar apenas cookie httpOnly
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        hasLunchBreak: user.hasLunchBreak,
      },
      token,
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro no login:`, err);
    return res.status(500).json({ error: "Erro interno do servidor", errorId });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Blacklistar o token atual para impedir replay
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    blacklistToken(token);
  }
  res.clearCookie("token");
  return res.json({ message: "Logout realizado" });
});

// POST /api/auth/change-password
router.post("/change-password", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ error: "A nova senha deve ter pelo menos 8 caracteres" });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ error: "Senha muito longa (máx 128 caracteres)" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "A nova senha deve ser diferente da atual" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (!user || !user.active) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Invalida o token atual — usuário precisa fazer login novamente com a nova senha
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (token) blacklistToken(token);
    res.clearCookie("token");

    return res.json({ message: "Senha alterada com sucesso. Faça login novamente." });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao alterar senha:`, err);
    return res.status(500).json({ error: "Erro ao alterar senha", errorId });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        position: users.position,
        hasLunchBreak: users.hasLunchBreak,
      })
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ user });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao buscar usuário:`, err);
    return res.status(500).json({ error: "Erro interno do servidor", errorId });
  }
});

export default router;
