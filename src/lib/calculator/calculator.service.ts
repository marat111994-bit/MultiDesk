import { PrismaClient } from '@prisma/client';
import { haversineDistance } from './haversine';
import { getRoadDistance } from './openroute';

const prisma = new PrismaClient();

// ==================== ТИПЫ ====================

export interface VolumeResult {
  volumeT: number;
  volumeM3: number;
}

export interface TransportCalculationResult {
  distanceKm: number;
  transportTariff: number;
  transportPrice: number;
  utilizationPrice?: number;
  totalPrice: number;
  volumeT: number;
  volumeM3: number;
  scenario: number;
}

export interface DisposalOption {
  polygonId: string;
  polygonName: string;
  polygonAddress: string;
  polygonCoords: string | null;
  distanceKm: number;
  transportTariff: number;
  transportPrice: number;
  utilizationTariff: number;
  utilizationPrice: number;
  totalPrice: number;
  volumeT: number;
  volumeM3: number;
  scenario: number;
}

export interface DisposalCalculationResult {
  options: DisposalOption[];
  volumeT: number;
  volumeM3: number;
}

export interface HyperbolicParams {
  a: number;
  b: number;
  c: number;
}

export interface TariffPoint {
  km: number;
  tariff: number;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

/**
 * Определяет объёмы в тоннах и кубометрах на основе входных данных.
 */
function resolveVolumes(volume: number, unit: 't' | 'm3', compaction: number): VolumeResult {
  if (unit === 't') {
    return { volumeT: volume, volumeM3: volume / compaction };
  } else {
    return { volumeM3: volume, volumeT: volume * compaction };
  }
}

/**
 * Парсит координаты из строки "lat,lon" или JSON.
 */
function parseCoords(coordsString: string | null): { lat: number; lon: number } | null {
  if (!coordsString) return null;

  try {
    // Пробуем как JSON
    const parsed = JSON.parse(coordsString);
    if (parsed.lat && parsed.lon) {
      return { lat: parsed.lat, lon: parsed.lon };
    }
  } catch {
    // Пробуем как "lat,lon"
    const parts = coordsString.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      return { lat: parts[0], lon: parts[1] };
    }
  }

  return null;
}

// ==================== ИНТЕРПОЛЯЦИЯ ТАРИФА ПО РАССТОЯНИЮ ====================

/**
 * Получает тариф перевозки по расстоянию.
 * Ищет точное совпадение или ближайший тариф.
 */
export async function getTariffByDistance(distanceKm: number): Promise<{
  baseTariffT: number;
  baseTariffTkm: number;
  baseTariffM3: number;
  baseTariffM3km: number;
  volumeCoeff: number;
} | null> {
  const roundedKm = Math.round(distanceKm);

  // Ищем точное совпадение
  let tariff = await prisma.transportTariff.findUnique({
    where: { distanceKm: roundedKm },
  });

  if (tariff) {
    return {
      baseTariffT: tariff.baseTariffT,
      baseTariffTkm: tariff.baseTariffTkm,
      baseTariffM3: tariff.baseTariffM3,
      baseTariffM3km: tariff.baseTariffM3km,
      volumeCoeff: tariff.volumeCoeff,
    };
  }

  // Ищем ближайший тариф
  const nearest = await prisma.transportTariff.findFirst({
    orderBy: { distanceKm: 'asc' },
  });

  if (!nearest) return null;

  // Находим ближайший по расстоянию
  const allTariffs = await prisma.transportTariff.findMany({
    select: { distanceKm: true },
  });

  let nearestTariff = allTariffs[0];
  let minDiff = Math.abs(allTariffs[0].distanceKm - roundedKm);

  for (const t of allTariffs) {
    const diff = Math.abs(t.distanceKm - roundedKm);
    if (diff < minDiff) {
      minDiff = diff;
      nearestTariff = t;
    }
  }

  const result = await prisma.transportTariff.findUnique({
    where: { distanceKm: nearestTariff.distanceKm },
  });

  if (!result) return null;

  return {
    baseTariffT: result.baseTariffT,
    baseTariffTkm: result.baseTariffTkm,
    baseTariffM3: result.baseTariffM3,
    baseTariffM3km: result.baseTariffM3km,
    volumeCoeff: result.volumeCoeff,
  };
}

// ==================== ФОРМУЛА ГИПЕРБОЛЫ ====================

/**
 * Решает систему уравнений для нахождения параметров гиперболы.
 * tariff(km) = a + b / (km + c)
 */
export function calculateHyperbolicParams(
  point1: TariffPoint,
  point2: TariffPoint,
  point3: TariffPoint
): HyperbolicParams | null {
  const { km: x1, tariff: y1 } = point1;
  const { km: x2, tariff: y2 } = point2;
  const { km: x3, tariff: y3 } = point3;

  // Система уравнений:
  // y1 = a + b / (x1 + c)
  // y2 = a + b / (x2 + c)
  // y3 = a + b / (x3 + c)

  // Вычитаем уравнения для исключения a:
  // y1 - y2 = b * (1/(x1+c) - 1/(x2+c))
  // y2 - y3 = b * (1/(x2+c) - 1/(x3+c))

  // Обозначим:
  const dy12 = y1 - y2;
  const dy23 = y2 - y3;

  // Метод подбора c через итерации (численное решение)
  // Начальное приближение c = 0
  let c = 0;
  const maxIterations = 1000;
  const tolerance = 1e-10;

  for (let i = 0; i < maxIterations; i++) {
    const f1 = 1 / (x1 + c) - 1 / (x2 + c);
    const f2 = 1 / (x2 + c) - 1 / (x3 + c);

    // b1 = dy12 / f1, b2 = dy23 / f2
    // Ищем c такое, что b1 = b2
    const b1 = dy12 / f1;
    const b2 = dy23 / f2;

    const diff = Math.abs(b1 - b2);

    if (diff < tolerance) {
      const b = (b1 + b2) / 2;
      const a = y1 - b / (x1 + c);
      return { a, b, c };
    }

    // Метод Ньютона для уточнения c
    // Упрощённо: сдвигаем c в нужном направлении
    const sign = b1 > b2 ? 1 : -1;
    c += sign * Math.max(0.1, diff / 100);

    // Защита от отрицательных знаменателей
    if (x1 + c <= 0 || x2 + c <= 0 || x3 + c <= 0) {
      c = Math.abs(c) + 1;
    }
  }

  // Если не сошлось, возвращаем приближённое решение
  const b = (dy12 / (1 / (x1 + c) - 1 / (x2 + c)) + dy23 / (1 / (x2 + c) - 1 / (x3 + c))) / 2;
  const a = y1 - b / (x1 + c);

  return { a, b, c };
}

/**
 * Генерирует матрицу гиперболических тарифов.
 */
export async function generateHyperbolicTariffs(config: {
  paramA: number;
  paramB: number;
  paramC: number;
  maxDistanceKm: number;
}): Promise<void> {
  const { paramA, paramB, paramC, maxDistanceKm } = config;

  const tariffs = [];
  for (let km = 1; km <= maxDistanceKm; km++) {
    const tariff = paramA + paramB / (km + paramC);
    tariffs.push({
      distanceKm: km,
      baseTariffT: tariff,
      baseTariffTkm: tariff / km,
      baseTariffM3: tariff,
      baseTariffM3km: tariff / km,
      volumeCoeff: 1.4,
      marginT: 0,
      marginTkm: 0,
      marginM3: 0,
      marginM3km: 0,
      outgoingTariffT: 0,
      outgoingTariffTkm: 0,
      outgoingTariffM3: 0,
      outgoingTariffM3km: 0,
    });
  }

  // Bulk insert (SQLite не поддерживает skipDuplicates в createMany)
  try {
    await prisma.transportTariff.createMany({
      data: tariffs,
    });
  } catch {
    // Если запись уже существует — обновляем
    for (const t of tariffs) {
      await prisma.transportTariff.upsert({
        where: { distanceKm: t.distanceKm },
        update: t,
        create: t,
      });
    }
  }
}

// ==================== КАЛЬКУЛЯТОР ПЕРЕВОЗКИ ====================

/**
 * Рассчитывает стоимость перевозки.
 */
export async function calculateTransport(input: {
  pickupCoords: { lat: number; lon: number };
  dropoffCoords: { lat: number; lon: number };
  volume: number;
  unit: 't' | 'm3';
  compaction: number;
}): Promise<TransportCalculationResult> {
  const { pickupCoords, dropoffCoords, volume, unit, compaction } = input;

  // 1. Рассчитываем расстояние
  const distanceKm = await getRoadDistance(
    pickupCoords.lat,
    pickupCoords.lon,
    dropoffCoords.lat,
    dropoffCoords.lon
  );

  // 2. Получаем тариф
  const tariffData = await getTariffByDistance(distanceKm);

  if (!tariffData) {
    // Нет данных о тарифах — возвращаем нули
    const volumes = resolveVolumes(volume, unit, compaction);
    return {
      distanceKm,
      transportTariff: 0,
      transportPrice: 0,
      totalPrice: 0,
      volumeT: volumes.volumeT,
      volumeM3: volumes.volumeM3,
      scenario: 0,
    };
  }

  // 3. Определяем объёмы
  const volumes = resolveVolumes(volume, unit, compaction);
  const { volumeT, volumeM3 } = volumes;

  // 4. Определяем сценарий и рассчитываем стоимость
  const isHeavy = compaction >= 1;
  let scenario: number;
  let transportTariff: number;
  let transportPrice: number;

  if (unit === 't' && isHeavy) {
    // СЦЕНАРИЙ 1: Тонны, K ≥ 1 (тяжёлый груз)
    scenario = 1;
    transportTariff = tariffData.baseTariffT;
    transportPrice = tariffData.baseTariffT * volumeT;
  } else if (unit === 't' && !isHeavy) {
    // СЦЕНАРИЙ 2: Тонны, K < 1 (лёгкий груз в тоннах)
    scenario = 2;
    transportTariff = tariffData.baseTariffM3;
    transportPrice = tariffData.baseTariffM3 * volumeM3;
  } else if (unit === 'm3' && isHeavy) {
    // СЦЕНАРИЙ 3: Кубы, K ≥ 1 (тяжёлый груз в кубах)
    scenario = 3;
    transportTariff = tariffData.baseTariffT;
    transportPrice = tariffData.baseTariffT * volumeT;
  } else {
    // СЦЕНАРИЙ 4: Кубы, K < 1 (лёгкий груз в кубах)
    scenario = 4;
    transportTariff = tariffData.baseTariffM3;
    transportPrice = tariffData.baseTariffM3 * volumeM3;
  }

  return {
    distanceKm,
    transportTariff,
    transportPrice,
    totalPrice: transportPrice,
    volumeT,
    volumeM3,
    scenario,
  };
}

// ==================== КАЛЬКУЛЯТОР УТИЛИЗАЦИИ ====================

/**
 * Рассчитывает стоимость утилизации для одного полигона.
 */
function calculateDisposalForPolygon(
  polygon: {
    id: string;
    receiverName: string;
    facilityAddress: string;
    facilityCoordinates: string | null;
  },
  utilizationTariffRubT: number,
  pickupCoords: { lat: number; lon: number },
  distanceKm: number,
  volume: number,
  unit: 't' | 'm3',
  compaction: number,
  transportTariffData: {
    baseTariffT: number;
    baseTariffM3: number;
  }
): DisposalOption | null {
  const volumes = resolveVolumes(volume, unit, compaction);
  const { volumeT, volumeM3 } = volumes;

  const isHeavy = compaction >= 1;
  let scenario: number;
  let transportTariff: number;
  let transportPrice: number;
  let utilizationPrice: number;

  if (unit === 't' && isHeavy) {
    // СЦЕНАРИЙ 1: Тонны, K ≥ 1 (тяжёлый груз)
    scenario = 1;
    transportTariff = transportTariffData.baseTariffT;
    transportPrice = transportTariffData.baseTariffT * volumeT;
    utilizationPrice = utilizationTariffRubT * volumeT;
  } else if (unit === 't' && !isHeavy) {
    // СЦЕНАРИЙ 2: Тонны, K < 1 (лёгкий груз в тоннах)
    scenario = 2;
    transportTariff = transportTariffData.baseTariffM3;
    transportPrice = transportTariffData.baseTariffM3 * volumeM3;
    utilizationPrice = utilizationTariffRubT * volumeT; // ← всегда тонны
  } else if (unit === 'm3' && isHeavy) {
    // СЦЕНАРИЙ 3: Кубы, K ≥ 1 (тяжёлый груз в кубах)
    scenario = 3;
    transportTariff = transportTariffData.baseTariffT;
    transportPrice = transportTariffData.baseTariffT * volumeT;
    utilizationPrice = (utilizationTariffRubT * compaction) * volumeM3;
  } else {
    // СЦЕНАРИЙ 4: Кубы, K < 1 (лёгкий груз в кубах)
    scenario = 4;
    transportTariff = transportTariffData.baseTariffM3;
    transportPrice = transportTariffData.baseTariffM3 * volumeM3;
    utilizationPrice = utilizationTariffRubT * volumeM3;
  }

  return {
    polygonId: polygon.id,
    polygonName: polygon.receiverName,
    polygonAddress: polygon.facilityAddress,
    polygonCoords: polygon.facilityCoordinates,
    distanceKm,
    transportTariff,
    transportPrice,
    utilizationTariff: utilizationTariffRubT,
    utilizationPrice,
    totalPrice: transportPrice + utilizationPrice,
    volumeT,
    volumeM3,
    scenario,
  };
}

/**
 * Рассчитывает стоимость утилизации с автоматическим выбором полигона.
 * Возвращает топ-5 вариантов.
 */
export async function calculateDisposalAuto(input: {
  pickupCoords: { lat: number; lon: number };
  fkkoCode: string;
  volume: number;
  unit: 't' | 'm3';
  compaction: number;
}): Promise<DisposalCalculationResult> {
  const { pickupCoords, fkkoCode, volume, unit, compaction } = input;

  // 1. Находим все полигоны с тарифами для данного FKCO
  const utilizationTariffs = await prisma.utilizationTariff.findMany({
    where: { fkkoCode },
    include: {
      polygon: {
        select: {
          id: true,
          receiverName: true,
          facilityAddress: true,
          facilityCoordinates: true,
          isActive: true,
        },
      },
    },
  });

  // Фильтруем активные полигоны
  const activeTariffs = utilizationTariffs.filter((ut) => ut.polygon.isActive);

  if (activeTariffs.length === 0) {
    return { options: [], volumeT: 0, volumeM3: 0 };
  }

  // 2. Для каждого полигона считаем расстояние по Haversine
  const polygonsWithDistance: Array<{
    polygon: {
      id: string;
      receiverName: string;
      facilityAddress: string;
      facilityCoordinates: string | null;
    };
    utilizationTariffRubT: number;
    haversineDistance: number;
  }> = [];

  for (const ut of activeTariffs) {
    const coords = parseCoords(ut.polygon.facilityCoordinates);
    if (!coords) continue;

    const hDistance = haversineDistance(
      pickupCoords.lat,
      pickupCoords.lon,
      coords.lat,
      coords.lon
    );

    polygonsWithDistance.push({
      polygon: ut.polygon,
      utilizationTariffRubT: ut.tariffRubT,
      haversineDistance: hDistance,
    });
  }

  // 3. Сортируем по Haversine, берём топ-20
  polygonsWithDistance.sort((a, b) => a.haversineDistance - b.haversineDistance);
  const top20 = polygonsWithDistance.slice(0, 20);

  // 4. Для топ-20 запрашиваем реальное расстояние через OpenRouteService
  const polygonsWithRoadDistance: Array<{
    polygon: {
      id: string;
      receiverName: string;
      facilityAddress: string;
      facilityCoordinates: string | null;
    };
    utilizationTariffRubT: number;
    distanceKm: number;
  }> = [];

  for (const item of top20) {
    const coords = parseCoords(item.polygon.facilityCoordinates);
    if (!coords) continue;

    const roadDistance = await getRoadDistance(
      pickupCoords.lat,
      pickupCoords.lon,
      coords.lat,
      coords.lon
    );

    polygonsWithRoadDistance.push({
      polygon: item.polygon,
      utilizationTariffRubT: item.utilizationTariffRubT,
      distanceKm: roadDistance,
    });
  }

  // 5. Получаем тариф перевозки (усреднённый или по максимальному расстоянию)
  const maxDistance = Math.max(...polygonsWithRoadDistance.map((p) => p.distanceKm), 1);
  const tariffData = await getTariffByDistance(maxDistance);

  if (!tariffData) {
    return { options: [], volumeT: 0, volumeM3: 0 };
  }

  // 6. Рассчитываем стоимость для каждого полигона
  const options: DisposalOption[] = [];

  for (const item of polygonsWithRoadDistance) {
    const option = calculateDisposalForPolygon(
      item.polygon,
      item.utilizationTariffRubT,
      pickupCoords,
      item.distanceKm,
      volume,
      unit,
      compaction,
      { baseTariffT: tariffData.baseTariffT, baseTariffM3: tariffData.baseTariffM3 }
    );

    if (option) {
      options.push(option);
    }
  }

  // 7. Сортируем по totalPrice, возвращаем топ-5
  options.sort((a, b) => a.totalPrice - b.totalPrice);

  const volumes = resolveVolumes(volume, unit, compaction);

  return {
    options: options.slice(0, 5),
    volumeT: volumes.volumeT,
    volumeM3: volumes.volumeM3,
  };
}

/**
 * Рассчитывает стоимость утилизации для конкретного полигона.
 */
export async function calculateDisposalSingle(input: {
  pickupCoords: { lat: number; lon: number };
  fkkoCode: string;
  volume: number;
  unit: 't' | 'm3';
  compaction: number;
  polygonId: string;
}): Promise<DisposalOption | null> {
  const { pickupCoords, fkkoCode, volume, unit, compaction, polygonId } = input;

  // 1. Находим тариф для данного FKCO и полигона
  const utilizationTariff = await prisma.utilizationTariff.findUnique({
    where: {
      fkkoCode_polygonId: {
        fkkoCode,
        polygonId,
      },
    },
    include: {
      polygon: {
        select: {
          id: true,
          receiverName: true,
          facilityAddress: true,
          facilityCoordinates: true,
          isActive: true,
        },
      },
    },
  });

  if (!utilizationTariff || !utilizationTariff.polygon.isActive) {
    return null;
  }

  // 2. Получаем координаты полигона
  const coords = parseCoords(utilizationTariff.polygon.facilityCoordinates);
  if (!coords) {
    return null;
  }

  // 3. Рассчитываем расстояние
  const distanceKm = await getRoadDistance(
    pickupCoords.lat,
    pickupCoords.lon,
    coords.lat,
    coords.lon
  );

  // 4. Получаем тариф перевозки
  const tariffData = await getTariffByDistance(distanceKm);
  if (!tariffData) {
    return null;
  }

  // 5. Рассчитываем стоимость
  return calculateDisposalForPolygon(
    utilizationTariff.polygon,
    utilizationTariff.tariffRubT,
    pickupCoords,
    distanceKm,
    volume,
    unit,
    compaction,
    { baseTariffT: tariffData.baseTariffT, baseTariffM3: tariffData.baseTariffM3 }
  );
}

// ==================== ЭКСПОРТ ДЛЯ ПРИМЕРА ====================

/**
 * Пример использования:
 *
 * // Перевозка
 * const transport = await calculateTransport({
 *   pickupCoords: { lat: 55.7558, lon: 37.6173 },
 *   dropoffCoords: { lat: 55.8000, lon: 37.7000 },
 *   volume: 10,
 *   unit: 't',
 *   compaction: 1.4,
 * });
 *
 * // Утилизация (авто-выбор)
 * const disposal = await calculateDisposalAuto({
 *   pickupCoords: { lat: 55.7558, lon: 37.6173 },
 *   fkkoCode: '81112311394',
 *   volume: 10,
 *   unit: 't',
 *   compaction: 1.4,
 * });
 *
 * // Утилизация (конкретный полигон)
 * const single = await calculateDisposalSingle({
 *   pickupCoords: { lat: 55.7558, lon: 37.6173 },
 *   fkkoCode: '81112311394',
 *   volume: 10,
 *   unit: 't',
 *   compaction: 1.4,
 *   polygonId: 'polygon-123',
 * });
 */
