/**
 * Remove HTML tags e entidades perigosas de strings
 * Previne XSS stored no banco de dados
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitiza um objeto inteiro (campos string)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === "string") {
      (result as any)[field] = sanitizeHtml(result[field] as string);
    }
  }
  return result;
}
