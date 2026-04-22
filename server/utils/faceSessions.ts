import crypto from "crypto";

interface FaceSession {
  id: string;
  purpose: "register" | "verify";
  userId?: number; // obrigatório se purpose=register
  requestedBy: number; // userId de quem criou a sessão
  createdAt: Date;
  expiresAt: Date;
  status: "pending" | "completed" | "expired";
  result?: {
    descriptor: number[];
    matchedUserId?: number;
    matchedUserName?: string;
    confidence?: number;
    match?: boolean;
  };
}

const sessions = new Map<string, FaceSession>();

// Limpar sessões expiradas a cada 2 minutos
setInterval(() => {
  const now = new Date();
  for (const [id, session] of sessions) {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  }
}, 120000);

export function createSession(
  purpose: "register" | "verify",
  requestedBy: number,
  userId?: number
): FaceSession {
  const id = crypto.randomUUID();
  const session: FaceSession = {
    id,
    purpose,
    userId,
    requestedBy,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
    status: "pending",
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): FaceSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    session.status = "expired";
    sessions.delete(id);
    return null;
  }
  return session;
}

export function completeSession(
  id: string,
  result: FaceSession["result"]
): FaceSession | null {
  const session = sessions.get(id);
  if (!session || session.status !== "pending") return null;
  session.status = "completed";
  session.result = result;
  // Manter por mais 60s para o polling pegar
  session.expiresAt = new Date(Date.now() + 60000);
  return session;
}
