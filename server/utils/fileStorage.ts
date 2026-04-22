import { db } from "../db";
import { fileStorage } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Helpers de storage de arquivos usando bytea no PostgreSQL/Neon.
 *
 * Uso esperado: features específicas (contracheque, atestado de ajuste, documento de férias)
 * chamam saveFile() no upload e loadFile() no download. O endpoint de cada feature é
 * responsável por verificar autorização ANTES de chamar loadFile — não existe endpoint
 * genérico /api/files/:id pra evitar que qualquer usuário logado baixe qualquer arquivo.
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export interface SaveFileInput {
  filename: string;
  mimeType: string;
  data: Buffer;
  uploadedBy: number;
}

export interface SaveFileResult {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

export async function saveFile(input: SaveFileInput): Promise<SaveFileResult> {
  if (!input.data || input.data.length === 0) {
    throw new Error("Arquivo vazio");
  }
  if (input.data.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Arquivo excede o limite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`);
  }
  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
    throw new Error(`Tipo de arquivo não permitido: ${input.mimeType}`);
  }

  const [row] = await db
    .insert(fileStorage)
    .values({
      filename: input.filename.slice(0, 255),
      mimeType: input.mimeType,
      sizeBytes: input.data.length,
      data: input.data,
      uploadedBy: input.uploadedBy,
    })
    .returning({
      id: fileStorage.id,
      filename: fileStorage.filename,
      mimeType: fileStorage.mimeType,
      sizeBytes: fileStorage.sizeBytes,
      uploadedAt: fileStorage.uploadedAt,
    });

  return row;
}

export async function loadFile(id: number): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
  const [row] = await db
    .select({
      filename: fileStorage.filename,
      mimeType: fileStorage.mimeType,
      data: fileStorage.data,
    })
    .from(fileStorage)
    .where(eq(fileStorage.id, id))
    .limit(1);

  return row || null;
}

export async function deleteFile(id: number): Promise<boolean> {
  const deleted = await db.delete(fileStorage).where(eq(fileStorage.id, id)).returning({ id: fileStorage.id });
  return deleted.length > 0;
}
