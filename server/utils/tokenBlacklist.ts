/**
 * Token blacklist em memória — invalida tokens após logout
 * Em produção com múltiplas instâncias, usar Redis
 */
const blacklist = new Set<string>();

// Limpar tokens expirados a cada hora para evitar memory leak
setInterval(() => {
  blacklist.clear();
}, 60 * 60 * 1000);

export function blacklistToken(token: string): void {
  blacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
