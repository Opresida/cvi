import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum("user_role", ["admin", "gestor", "funcionario"]);
export const employmentTypeEnum = pgEnum("employment_type", ["clt", "pj"]);
export const punchTypeEnum = pgEnum("punch_type", [
  "entrada",
  "saida_almoco",
  "volta_almoco",
  "saida",
]);
export const punchStatusEnum = pgEnum("punch_status", ["valido", "fora_perimetro", "ajuste_pendente", "ajustado"]);
export const adjustmentStatusEnum = pgEnum("adjustment_status", ["pendente", "aprovado", "rejeitado"]);

// ============================================
// TABELA: Configurações do sistema
// ============================================

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  // Geofencing
  sedeLatitude: numeric("sede_latitude", { precision: 10, scale: 7 }).notNull().default("-3.0820000"),
  sedeLongitude: numeric("sede_longitude", { precision: 10, scale: 7 }).notNull().default("-59.9740000"),
  geofenceRadius: integer("geofence_radius").notNull().default(100), // metros — dentro: valido
  geofenceMaxRadius: integer("geofence_max_radius").notNull().default(350), // metros — além: rejeitado
  // Tolerância
  toleranceMinutes: integer("tolerance_minutes").notNull().default(10),
  // Fechamento
  closingDay: integer("closing_day").notNull().default(20),
  // Banco de horas
  bankHoursMaxMonths: integer("bank_hours_max_months").notNull().default(12),
  overtimeWeekday: numeric("overtime_weekday", { precision: 5, scale: 2 }).notNull().default("50.00"),
  overtimeWeekend: numeric("overtime_weekend", { precision: 5, scale: 2 }).notNull().default("75.00"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Usuários (funcionários + gestores)
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("funcionario"),
  employmentType: employmentTypeEnum("employment_type").notNull().default("clt"),
  department: varchar("department", { length: 255 }),
  position: varchar("position", { length: 255 }),
  // Controle de ponto
  requiresPunch: boolean("requires_punch").notNull().default(true),
  // Jornada configurável
  weeklyHours: integer("weekly_hours").notNull().default(44),
  dailyHours: integer("daily_hours").notNull().default(8),
  workStartTime: varchar("work_start_time", { length: 5 }).default("08:00"), // HH:MM
  workEndTime: varchar("work_end_time", { length: 5 }).default("17:00"),
  lunchDurationMinutes: integer("lunch_duration_minutes").notNull().default(60),
  // Reconhecimento facial (embedding 128d)
  faceDescriptor: text("face_descriptor"), // JSON array de 128 números
  faceRegisteredAt: timestamp("face_registered_at"),
  //
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Registros de Ponto
// ============================================

export const punchRecords = pgTable("punch_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: punchTypeEnum("type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  // Geolocalização
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  distanceFromSede: numeric("distance_from_sede", { precision: 8, scale: 2 }), // metros
  status: punchStatusEnum("status").notNull().default("valido"),
  // Metadata
  notes: text("notes"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Solicitações de Ajuste de Ponto
// ============================================

export const punchAdjustments = pgTable("punch_adjustments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  // Pode ser ajuste de um registro existente ou criação de novo
  punchRecordId: integer("punch_record_id").references(() => punchRecords.id),
  // Dados do ajuste solicitado
  requestedType: punchTypeEnum("requested_type").notNull(),
  requestedTimestamp: timestamp("requested_timestamp").notNull(),
  reason: text("reason").notNull(),
  attachmentUrl: text("attachment_url"), // URL do atestado/documento
  // Aprovação
  status: adjustmentStatusEnum("status").notNull().default("pendente"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  //
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// TYPES inferidos do schema
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PunchRecord = typeof punchRecords.$inferSelect;
export type NewPunchRecord = typeof punchRecords.$inferInsert;
export type PunchAdjustment = typeof punchAdjustments.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
