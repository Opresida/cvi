import { Router } from "express";
import { db } from "../db";
import { punchRecords, users, systemSettings } from "../db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { authMiddleware, gestorOrAdmin, generateErrorId, type AuthRequest } from "../middleware/auth";
import { isWithinGeofence } from "../utils/geofence";
import { sanitizeHtml } from "../utils/sanitize";

const router = Router();
router.use(authMiddleware);

async function getSettings() {
  const [settings] = await db.select().from(systemSettings).limit(1);
  return settings || {
    sedeLatitude: "-3.0820000",
    sedeLongitude: "-59.9740000",
    geofenceRadius: 100,
    toleranceMinutes: 10,
    closingDay: 20,
  };
}

function validateCoordinates(lat: any, lon: any): { valid: boolean; lat?: number; lon?: number } {
  if (!lat && !lon) return { valid: true }; // GPS opcional
  if ((lat && !lon) || (!lat && lon)) return { valid: false }; // ambos ou nenhum
  const latStr = String(lat).trim();
  const lonStr = String(lon).trim();
  // Validar que é puramente numérico (com . e - opcional)
  const coordRegex = /^-?\d+(\.\d+)?$/;
  if (!coordRegex.test(latStr) || !coordRegex.test(lonStr)) {
    return { valid: false };
  }
  const latN = parseFloat(latStr);
  const lonN = parseFloat(lonStr);
  if (isNaN(latN) || isNaN(lonN) || latN < -90 || latN > 90 || lonN < -180 || lonN > 180) {
    return { valid: false };
  }
  return { valid: true, lat: latN, lon: lonN };
}

// POST /api/ponto/registrar
router.post("/registrar", async (req: AuthRequest, res) => {
  try {
    const { type, latitude, longitude, notes } = req.body;

    const validTypes = ["entrada", "saida_almoco", "volta_almoco", "saida"];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        error: "Tipo inválido. Use: entrada, saida_almoco, volta_almoco, saida",
      });
    }

    // Verificar se usuário requer ponto
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    if (!user?.requiresPunch) {
      return res.status(400).json({ error: "Seu perfil não requer registro de ponto" });
    }

    // HIGH FIX #4: Validação de coordenadas
    const coords = validateCoordinates(latitude, longitude);
    if (!coords.valid) {
      return res.status(400).json({ error: "Coordenadas GPS inválidas" });
    }

    // HIGH FIX #5: Anti-duplicação — bloqueia mesmo tipo nos últimos 60s
    const [recentDuplicate] = await db
      .select({ id: punchRecords.id })
      .from(punchRecords)
      .where(
        and(
          eq(punchRecords.userId, req.user!.userId),
          eq(punchRecords.type, type),
          gte(punchRecords.timestamp, sql`now() - interval '60 seconds'`)
        )
      )
      .limit(1);

    if (recentDuplicate) {
      return res.status(409).json({ error: "Ponto já registrado nos últimos 60 segundos" });
    }

    // Geofencing
    const settings = await getSettings();
    let status: "valido" | "fora_perimetro" = "valido";
    let distanceFromSede: number | null = null;

    if (coords.lat !== undefined && coords.lon !== undefined) {
      const geo = isWithinGeofence(
        coords.lat,
        coords.lon,
        parseFloat(String(settings.sedeLatitude)),
        parseFloat(String(settings.sedeLongitude)),
        settings.geofenceRadius
      );
      distanceFromSede = geo.distance;
      if (!geo.within) {
        status = "fora_perimetro";
      }
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress || null;
    const userAgent = req.headers["user-agent"]?.slice(0, 500) || null;

    const [record] = await db
      .insert(punchRecords)
      .values({
        userId: req.user!.userId,
        type,
        latitude: coords.lat !== undefined ? String(coords.lat) : null,
        longitude: coords.lon !== undefined ? String(coords.lon) : null,
        distanceFromSede: distanceFromSede !== null ? String(distanceFromSede) : null,
        status,
        notes: notes ? sanitizeHtml(String(notes).slice(0, 500)) : null,
        ipAddress,
        userAgent,
      })
      .returning();

    return res.status(201).json({
      record,
      geofence: {
        within: status === "valido",
        distance: distanceFromSede,
        radius: settings.geofenceRadius,
      },
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao registrar ponto:`, err);
    return res.status(500).json({ error: "Erro ao registrar ponto", errorId });
  }
});

// GET /api/ponto/hoje
router.get("/hoje", async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await db
      .select()
      .from(punchRecords)
      .where(
        and(
          eq(punchRecords.userId, req.user!.userId),
          gte(punchRecords.timestamp, today),
          lte(punchRecords.timestamp, tomorrow)
        )
      )
      .orderBy(punchRecords.timestamp);

    return res.json({ records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao buscar registros:`, err);
    return res.status(500).json({ error: "Erro ao buscar registros", errorId });
  }
});

// GET /api/ponto/historico?dias=30
router.get("/historico", async (req: AuthRequest, res) => {
  try {
    // MEDIUM FIX #9: bounds checking
    const dias = Math.min(Math.max(1, parseInt(req.query.dias as string) || 30), 365);
    const since = new Date();
    since.setDate(since.getDate() - dias);

    const records = await db
      .select()
      .from(punchRecords)
      .where(
        and(
          eq(punchRecords.userId, req.user!.userId),
          gte(punchRecords.timestamp, since)
        )
      )
      .orderBy(desc(punchRecords.timestamp));

    return res.json({ records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao buscar histórico:`, err);
    return res.status(500).json({ error: "Erro ao buscar histórico", errorId });
  }
});

// GET /api/ponto/espelho?mes=2026-04&userId=X
router.get("/espelho", async (req: AuthRequest, res) => {
  try {
    const targetUserId = req.query.userId
      ? parseInt(req.query.userId as string)
      : req.user!.userId;

    if (isNaN(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    if (targetUserId !== req.user!.userId) {
      const [requester] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
      if (!requester || !["admin", "gestor"].includes(requester.role)) {
        return res.status(403).json({ error: "Sem permissão para ver espelho de outro funcionário" });
      }
    }

    const mes = (req.query.mes as string) || new Date().toISOString().slice(0, 7);
    const match = mes.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      return res.status(400).json({ error: "Formato de mês inválido (use YYYY-MM)" });
    }

    const [year, month] = [parseInt(match[1]), parseInt(match[2])];
    if (month < 1 || month > 12) {
      return res.status(400).json({ error: "Mês inválido" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [employee] = await db
      .select({
        id: users.id, name: users.name, email: users.email,
        department: users.department, position: users.position,
        employmentType: users.employmentType, weeklyHours: users.weeklyHours,
        dailyHours: users.dailyHours, workStartTime: users.workStartTime,
        workEndTime: users.workEndTime,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!employee) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    const records = await db
      .select()
      .from(punchRecords)
      .where(
        and(
          eq(punchRecords.userId, targetUserId),
          gte(punchRecords.timestamp, startDate),
          lte(punchRecords.timestamp, endDate)
        )
      )
      .orderBy(punchRecords.timestamp);

    const dailyRecords: Record<string, typeof records> = {};
    for (const r of records) {
      const day = new Date(r.timestamp).toISOString().slice(0, 10);
      if (!dailyRecords[day]) dailyRecords[day] = [];
      dailyRecords[day].push(r);
    }

    return res.json({
      employee, month: mes, records, dailyRecords,
      totalDays: Object.keys(dailyRecords).length,
      totalPunches: records.length,
    });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro ao gerar espelho:`, err);
    return res.status(500).json({ error: "Erro ao gerar espelho de ponto", errorId });
  }
});

// GET /api/ponto/todos (admin/gestor)
router.get("/todos", gestorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const dias = Math.min(Math.max(1, parseInt(req.query.dias as string) || 7), 365);
    const since = new Date();
    since.setDate(since.getDate() - dias);

    const records = await db
      .select({
        id: punchRecords.id, type: punchRecords.type,
        timestamp: punchRecords.timestamp, latitude: punchRecords.latitude,
        longitude: punchRecords.longitude, distanceFromSede: punchRecords.distanceFromSede,
        status: punchRecords.status, notes: punchRecords.notes,
        userId: punchRecords.userId, userName: users.name,
        userEmail: users.email, userDepartment: users.department,
      })
      .from(punchRecords)
      .innerJoin(users, eq(punchRecords.userId, users.id))
      .where(gte(punchRecords.timestamp, since))
      .orderBy(desc(punchRecords.timestamp));

    return res.json({ records });
  } catch (err) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Erro:`, err);
    return res.status(500).json({ error: "Erro ao buscar registros", errorId });
  }
});

export default router;
