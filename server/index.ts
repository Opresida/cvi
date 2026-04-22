import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import authRoutes from "./routes/auth";
import pontoRoutes from "./routes/ponto";
import employeesRoutes from "./routes/employees";
import adjustmentsRoutes from "./routes/adjustments";
import faceRoutes from "./routes/face";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

function buildAllowedOrigins(): string[] {
  const origins: string[] = [
    "http://localhost:5000",
    "https://cviam.com.br",
    "https://www.cviam.com.br",
  ];

  if (process.env.REPLIT_DEV_DOMAIN) {
    origins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    origins.push(`https://${process.env.REPLIT_DEV_DOMAIN}:5000`);
  }

  if (process.env.FRONTEND_URL && !origins.includes(process.env.FRONTEND_URL)) {
    origins.push(process.env.FRONTEND_URL);
  }

  return origins;
}

const ALLOWED_ORIGINS = buildAllowedOrigins();

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
}));
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

// Servir frontend (build estático) em produção / Replit
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

// SPA fallback — qualquer rota que não seja /api vai pro index.html
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🟢 CVI rodando na porta ${PORT} (0.0.0.0)`);
  console.log(`   Origens CORS aceitas: ${ALLOWED_ORIGINS.join(", ")}`);

  fetch(`http://localhost:${PORT}/api/health`)
    .then((res) => res.json())
    .then((data) => {
      console.log(`✅ Health check OK — ${JSON.stringify(data)}`);
    })
    .catch((err) => {
      console.error(`❌ Health check falhou: ${err.message}`);
    });
});

export default app;
