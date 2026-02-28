/**
 * Вычисляет расстояние между двумя точками по формуле Haversine.
 * @param lat1 Широта первой точки (градусы)
 * @param lon1 Долгота первой точки (градусы)
 * @param lat2 Широта второй точки (градусы)
 * @param lon2 Долгота второй точки (градусы)
 * @returns Расстояние в километрах
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Вычисляет приблизительное дорожное расстояние на основе Haversine.
 * Использует коэффициент 1.3 для учёта извилистости дорог.
 */
export function haversineRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return haversineDistance(lat1, lon1, lat2, lon2) * 1.3;
}
