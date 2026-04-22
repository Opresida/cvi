import { db } from "../db";
import { monthlyTreatments } from "../db/schema";
import { eq, and, lt } from "drizzle-orm";

/**
 * Aprova automaticamente tratamentos cujo timer de 24h expirou.
 * Tratamentos com status "submitted_to_employee" cujo submittedAt < now - 24h
 * são migrados para "auto_approved".
 */
export async function runAutoApproveSweep(): Promise<number> {
  const deadline = new Date(Date.now() - 24 * 60 * 60 * 1000); // agora - 24h

  const updated = await db
    .update(monthlyTreatments)
    .set({ status: "auto_approved", decisionAt: new Date(), updatedAt: new Date() })
    .where(and(
      eq(monthlyTreatments.status, "submitted_to_employee"),
      lt(monthlyTreatments.submittedAt, deadline),
    ))
    .returning({ id: monthlyTreatments.id });

  if (updated.length > 0) {
    console.log(`🕐 [auto-approve] ${updated.length} tratamento(s) aprovado(s) por timeout de 24h`);
  }

  return updated.length;
}

/**
 * Agenda a varredura para rodar a cada 5 minutos enquanto o processo viver.
 */
export function startAutoApproveScheduler() {
  const EVERY_5_MINUTES = 5 * 60 * 1000;
  // Dispara imediatamente uma varredura ao iniciar (limpa pendências de quando o servidor estava fora do ar)
  runAutoApproveSweep().catch((err) => console.error("[auto-approve] erro na varredura inicial:", err));
  setInterval(() => {
    runAutoApproveSweep().catch((err) => console.error("[auto-approve] erro na varredura:", err));
  }, EVERY_5_MINUTES);
}
