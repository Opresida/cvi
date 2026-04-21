import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";
import { isTokenBlacklisted } from "../utils/tokenBlacklist";

// CRITICAL FIX #1: JWT_SECRET obrigatório — sem fallback inseguro
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definida no .env — servidor não pode iniciar sem ela");
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // Verificar blacklist (tokens invalidados por logout)
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: "Sessão encerrada. Faça login novamente." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// MEDIUM FIX #12: Middlewares separados e explícitos
export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

export function gestorOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !["admin", "gestor"].includes(req.user.role)) {
    return res.status(403).json({ error: "Acesso restrito a gestores" });
  }
  next();
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

// LOW FIX #18: Gerar ID de erro para correlação
export function generateErrorId(): string {
  return crypto.randomUUID().slice(0, 8);
}
