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
