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
  date,
  customType,
} from "drizzle-orm/pg-core";

// Tipo bytea (binary) — Postgres nativo
const bytea = customType<{ data: Buffer; default: false; notNull: false }>({
  dataType() {
    return "bytea";
  },
});

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
export const vacationStatusEnum = pgEnum("vacation_status", ["agendada", "em_curso", "concluida", "cancelada"]);
export const treatmentStatusEnum = pgEnum("treatment_status", [
  "draft",                     // admin editando, ainda não enviou pro funcionário
  "submitted_to_employee",     // enviado pra revisão (timer 24h inicia)
  "approved_by_employee",      // funcionário aprovou explicitamente
  "auto_approved",             // 24h passaram sem resposta — aprovado automaticamente
  "questioned",                // funcionário questionou, volta pro admin
]);

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
  hasLunchBreak: boolean("has_lunch_break").notNull().default(true), // false = jornada sem intervalo de almoço
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
  attachmentFileId: integer("attachment_file_id"), // FK pra file_storage (atestado, comprovante, etc)
  // Aprovação
  status: adjustmentStatusEnum("status").notNull().default("pendente"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  //
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Tratamento mensal de ponto
// Um registro por funcionário/mês — admin aplica descontos e abonos,
// depois envia para revisão do funcionário (ciclo de aprovação 24h — Bloco 6)
// ============================================

export const monthlyTreatments = pgTable("monthly_treatments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  referenceMonth: date("reference_month").notNull(), // primeiro dia do mês, ex: 2026-04-01
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  bonusAmount: numeric("bonus_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"), // admin detalha item a item no texto livre
  status: treatmentStatusEnum("status").notNull().default("draft"),
  // Workflow do Bloco 6 (ciclo de aprovação 24h)
  submittedAt: timestamp("submitted_at"),      // quando enviou pro funcionário
  decisionAt: timestamp("decision_at"),         // quando funcionário decidiu (aprovou ou questionou)
  employeeQuestion: text("employee_question"),  // texto do questionamento do funcionário
  // Metadata
  processedBy: integer("processed_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Férias
// 30 dias anuais, período único (sem divisão), vale pra CLT e PJ
// ============================================

export const vacations = pgTable("vacations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: vacationStatusEnum("status").notNull().default("agendada"),
  // Aviso prévio (CLT art. 135: mínimo 30 dias de antecedência)
  noticeFileId: integer("notice_file_id"), // FK pra file_storage — PDF do aviso de férias
  acknowledgedAt: timestamp("acknowledged_at"), // quando o funcionário confirmou ciência
  // Metadata
  notes: text("notes"), // observação do admin
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Contracheques mensais
// Um registro por funcionário/mês — admin faz upload, funcionário baixa
// ============================================

export const paystubs = pgTable("paystubs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  referenceMonth: date("reference_month").notNull(), // primeiro dia do mês
  fileId: integer("file_id").references(() => fileStorage.id).notNull(),
  notes: text("notes"), // observação opcional (ex: "Inclui 13º proporcional")
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Storage de arquivos (PDFs, atestados, contracheques)
// ============================================

export const fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  data: bytea("data").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// ============================================
// TABELA: Histórico de salário
// Novo registro a cada alteração. Salário vigente = mais recente com effectiveFrom <= hoje
// ============================================

export const salaryHistory = pgTable("salary_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  grossSalary: numeric("gross_salary", { precision: 12, scale: 2 }).notNull(), // bruto
  netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),     // líquido
  effectiveFrom: date("effective_from").notNull(), // data a partir da qual vale
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(), // admin que registrou
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
export type FileStorage = typeof fileStorage.$inferSelect;
export type NewFileStorage = typeof fileStorage.$inferInsert;
export type SalaryHistory = typeof salaryHistory.$inferSelect;
export type NewSalaryHistory = typeof salaryHistory.$inferInsert;
export type Vacation = typeof vacations.$inferSelect;
export type NewVacation = typeof vacations.$inferInsert;
export type MonthlyTreatment = typeof monthlyTreatments.$inferSelect;
export type NewMonthlyTreatment = typeof monthlyTreatments.$inferInsert;
export type Paystub = typeof paystubs.$inferSelect;
export type NewPaystub = typeof paystubs.$inferInsert;
