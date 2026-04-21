import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, systemSettings } from "./db/schema";
import "dotenv/config";

async function seed() {
  console.log("🌱 Iniciando seed...\n");

  // 1. Criar configurações do sistema
  console.log("⚙️  Criando configurações do sistema...");
  try {
    await db.insert(systemSettings).values({
      // Coordenadas da sede: R. Acari, 50 - Conj. Atílio Andreazza, Manaus-AM
      sedeLatitude: "-3.0820000",
      sedeLongitude: "-59.9740000",
      geofenceRadius: 100,
      toleranceMinutes: 10,
      closingDay: 20,
      bankHoursMaxMonths: 12,
      overtimeWeekday: "50.00",
      overtimeWeekend: "75.00",
    });
    console.log("   ✅ Configurações criadas (geofence 100m, tolerância 10min, fechamento dia 20)");
  } catch (err: any) {
    if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
      console.log("   ℹ️  Configurações já existem, pulando.");
    } else {
      // Pode ser que a tabela já tenha dados
      console.log("   ℹ️  Configurações já existem ou erro ignorável.");
    }
  }

  // 2. Criar usuário admin
  console.log("\n👤 Criando usuário admin...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  try {
    await db.insert(users).values({
      name: "Enéas Pimentel Pinto Filho",
      email: "admin@cviam.com.br",
      password: hashedPassword,
      role: "admin",
      employmentType: "pj",
      department: "Recursos Humanos",
      position: "Analista de RH Pleno",
      requiresPunch: true, // Enéas também bate ponto
    });

    console.log("   ✅ Usuário admin criado:");
    console.log("   E-mail: admin@cviam.com.br");
    console.log("   Senha:  admin123");
    console.log("   ⚠️  TROQUE A SENHA após o primeiro login!\n");
  } catch (err: any) {
    if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
      console.log("   ℹ️  Usuário admin já existe, pulando.\n");
    } else {
      console.error("   ❌ Erro no seed:", err);
    }
  }

  console.log("🏁 Seed finalizado!");
  process.exit(0);
}

seed();
