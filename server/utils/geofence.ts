/**
 * Calcula distância entre dois pontos (Haversine formula)
 * Retorna distância em metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Verifica se o ponto está dentro do raio permitido
 */
export function isWithinGeofence(
  userLat: number,
  userLon: number,
  sedeLat: number,
  sedeLon: number,
  radiusMeters: number
): { within: boolean; distance: number } {
  const distance = calculateDistance(userLat, userLon, sedeLat, sedeLon);
  return {
    within: distance <= radiusMeters,
    distance: Math.round(distance * 100) / 100,
  };
}
