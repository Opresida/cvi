import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import authRoutes from "./routes/auth";
import pontoRoutes from "./routes/ponto";
import employeesRoutes from "./routes/employees";
import adjustmentsRoutes from "./routes/adjustments";
import faceRoutes from "./routes/face";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// HIGH FIX #7: Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições, tente novamente em 15 minutos" },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login, tente novamente em 15 minutos" },
});

const punchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de registros de ponto atingido, aguarde 1 minuto" },
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/ponto/registrar", punchLimiter);

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/ponto", pontoRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/adjustments", adjustmentsRoutes);
app.use("/api/face", faceRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🟢 CVI Backend rodando na porta ${PORT}`);
});

export default app;
