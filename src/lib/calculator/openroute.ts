import { haversineRoadDistance } from './haversine';

// Кэш для результатов OpenRouteService (10 минут)
const distanceCache = new Map<string, { distance: number; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут

const ORS_API_KEY = process.env.OPENROUTE_API_KEY || process.env.ORS_API_KEY;
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

/**
 * Получает дорожное расстояние через OpenRouteService API с fallback на Haversine × 1.3.
 * Результаты кэшируются в памяти на 10 минут.
 *
 * @param fromLat Широта точки отправления
 * @param fromLon Долгота точки отправления
 * @param toLat Широта точки назначения
 * @param toLon Долгота точки назначения
 * @returns Расстояние в километрах
 */
export async function getRoadDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<number> {
  const cacheKey = `${fromLat},${fromLon}→${toLat},${toLon}`;
  const cached = distanceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.distance;
  }

  try {
    if (!ORS_API_KEY) {
      // API ключ не настроен — используем fallback
      const fallbackDistance = haversineRoadDistance(fromLat, fromLon, toLat, toLon);
      distanceCache.set(cacheKey, { distance: fallbackDistance, timestamp: Date.now() });
      return fallbackDistance;
    }

    const response = await fetch(
      `${OPENROUTE_BASE_URL}?api_key=${ORS_API_KEY}&start=${fromLon},${fromLat}&end=${toLon},${toLat}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouteService API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const distanceMeters = data.features?.[0]?.properties?.segments?.[0]?.distance;

    if (typeof distanceMeters !== 'number' || Number.isNaN(distanceMeters)) {
      throw new Error('Invalid distance data from OpenRouteService');
    }

    const distanceKm = distanceMeters / 1000;
    distanceCache.set(cacheKey, { distance: distanceKm, timestamp: Date.now() });
    return distanceKm;
  } catch (error) {
    console.error('OpenRouteService error, using fallback:', error);
    const fallbackDistance = haversineRoadDistance(fromLat, fromLon, toLat, toLon);
    distanceCache.set(cacheKey, { distance: fallbackDistance, timestamp: Date.now() });
    return fallbackDistance;
  }
}

/**
 * Очищает кэш расстояний.
 */
export function clearDistanceCache(): void {
  distanceCache.clear();
}

/**
 * Возвращает размер кэша (для отладки).
 */
export function getCacheSize(): number {
  return distanceCache.size;
}
