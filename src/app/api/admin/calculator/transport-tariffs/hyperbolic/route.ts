import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const hyperbolicSchema = z.object({
  point1Km: z.number().positive(),
  point1Tariff: z.number().positive(),
  point2Km: z.number().positive(),
  point2Tariff: z.number().positive(),
  point3Km: z.number().positive(),
  point3Tariff: z.number().positive(),
  hyperMinKm: z.number().positive().int(),
  hyperMaxKm: z.number().positive().int(),
  volumeCoeff: z.number().positive(),
  marginPercent: z.number().min(0).max(100),
  maxDistanceKm: z.number().positive(),
});

/**
 * Решение системы 3 уравнений для нахождения параметров a, b, c гиперболы
 * tariff(km) = a + b / (km + c)
 * 
 * Система уравнений:
 * tariff1 = a + b / (km1 + c)
 * tariff2 = a + b / (km2 + c)
 * tariff3 = a + b / (km3 + c)
 * 
 * Метод: численное решение через итерации Ньютона-Рафсона
 */
function solveHyperbola(
  km1: number, t1: number,
  km2: number, t2: number,
  km3: number, t3: number
): { a: number; b: number; c: number } | null {
  // Начальные приближения
  let c = 0;
  const maxIterations = 100;
  const epsilon = 1e-10;

  // Используем метод Ньютона для нахождения c
  // Из уравнений: (t1 - t2) = b * (1/(km1+c) - 1/(km2+c))
  //              (t2 - t3) = b * (1/(km2+c) - 1/(km3+c))
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const d1 = km1 + c;
    const d2 = km2 + c;
    const d3 = km3 + c;

    if (d1 <= 0 || d2 <= 0 || d3 <= 0) {
      c += 1;
      continue;
    }

    const inv1 = 1 / d1;
    const inv2 = 1 / d2;
    const inv3 = 1 / d3;

    // Вычисляем b из первых двух уравнений
    // t1 - t2 = b * (inv1 - inv2)
    const diff12 = t1 - t2;
    const invDiff12 = inv1 - inv2;
    
    if (Math.abs(invDiff12) < epsilon) {
      c += 0.1;
      continue;
    }

    const b = diff12 / invDiff12;
    const a = t1 - b * inv1;

    // Проверяем третье уравнение
    const calculatedT3 = a + b / d3;
    const error = Math.abs(calculatedT3 - t3);

    if (error < epsilon) {
      return { a, b, c };
    }

    // Корректируем c методом Ньютона
    // f(c) = t3 - (a + b/(km3+c)) = 0
    // f'(c) = b / (km3+c)^2
    const f = t3 - calculatedT3;
    const fp = b / (d3 * d3);
    
    if (Math.abs(fp) < epsilon) {
      c += 0.1;
      continue;
    }

    c = c + f / fp;

    // Ограничиваем c, чтобы знаменатели были положительными
    if (c < -Math.min(km1, km2, km3) + 1) {
      c = -Math.min(km1, km2, km3) + 1;
    }
  }

  // Если не сошлось, пробуем аналитическое решение
  // Для гиперболы y = a + b/(x+c)
  // Преобразуем: (y - a)(x + c) = b
  // (t1 - a)(km1 + c) = (t2 - a)(km2 + c) = (t3 - a)(km3 + c) = b
  
  // Метод подбора через минимизацию ошибки
  let bestC = 0;
  let bestError = Infinity;
  
  for (let testC = -Math.min(km1, km2, km3) + 0.1; testC < 1000; testC += 0.1) {
    const td1 = km1 + testC;
    const td2 = km2 + testC;
    const td3 = km3 + testC;
    
    if (td1 <= 0 || td2 <= 0 || td3 <= 0) continue;
    
    const tinv1 = 1 / td1;
    const tinv2 = 1 / td2;
    const tinv3 = 1 / td3;
    
    const tb = (t1 - t2) / (tinv1 - tinv2);
    const ta = t1 - tb * tinv1;
    
    const calcT3 = ta + tb / td3;
    const tError = Math.abs(calcT3 - t3);
    
    if (tError < bestError) {
      bestError = tError;
      bestC = testC;
    }
    
    if (tError < epsilon) {
      return { a: ta, b: tb, c: testC };
    }
  }
  
  // Возвращаем лучшее найденное решение
  if (bestError < 1) {
    const td1 = km1 + bestC;
    const td2 = km2 + bestC;
    
    const tinv1 = 1 / td1;
    const tinv2 = 1 / td2;
    
    const tb = (t1 - t2) / (tinv1 - tinv2);
    const ta = t1 - tb * tinv1;
    
    return { a: ta, b: tb, c: bestC };
  }

  return null;
}

/**
 * POST /api/admin/calculator/transport-tariffs/hyperbolic
 * Генерирует гиперболическую матрицу тарифов
 * Body: { point1Km, point1Tariff, point2Km, point2Tariff, point3Km, point3Tariff, hyperMinKm, hyperMaxKm, volumeCoeff, marginPercent, maxDistanceKm }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = hyperbolicSchema.parse(body);

    const {
      point1Km,
      point1Tariff,
      point2Km,
      point2Tariff,
      point3Km,
      point3Tariff,
      hyperMinKm,
      hyperMaxKm,
      volumeCoeff,
      marginPercent,
      maxDistanceKm,
    } = validatedData;

    // Решаем систему уравнений для нахождения параметров гиперболы
    const hyperbolaParams = solveHyperbola(
      point1Km, point1Tariff,
      point2Km, point2Tariff,
      point3Km, point3Tariff
    );

    if (!hyperbolaParams) {
      return NextResponse.json(
        { error: 'Не удалось найти параметры гиперболы. Проверьте входные данные.' },
        { status: 400 }
      );
    }

    const { a, b, c } = hyperbolaParams;
    const marginMultiplier = 1 - marginPercent / 100;
    const recordsToCreate = [];

    // Генерируем тарифы для каждого км от 1 до maxDistanceKm
    for (let km = 1; km <= maxDistanceKm; km++) {
      // Тариф по гиперболе: tariff(km) = a + b / (km + c)
      let baseTariffTkm = a + b / (km + c);
      
      // Ограничиваем диапазон применения гиперболы
      if (km < hyperMinKm) {
        // Для км меньше минимума используем тариф на hyperMinKm
        baseTariffTkm = a + b / (hyperMinKm + c);
      } else if (km > hyperMaxKm) {
        // Для км больше максимума используем тариф на hyperMaxKm
        baseTariffTkm = a + b / (hyperMaxKm + c);
      }

      // Не допускаем отрицательных тарифов
      if (baseTariffTkm < 0) {
        baseTariffTkm = a + b / (hyperMaxKm + c);
      }

      // Базовые тарифы
      const baseTariffT = baseTariffTkm * km;
      const baseTariffM3 = baseTariffT * volumeCoeff;
      const baseTariffM3km = baseTariffTkm * volumeCoeff;

      // Исходящие тарифы (с учётом маржи)
      const outgoingTariffT = baseTariffT * marginMultiplier;
      const outgoingTariffTkm = baseTariffTkm * marginMultiplier;
      const outgoingTariffM3 = baseTariffM3 * marginMultiplier;
      const outgoingTariffM3km = baseTariffM3km * marginMultiplier;

      // Маржа
      const marginT = baseTariffT - outgoingTariffT;
      const marginTkm = baseTariffTkm - outgoingTariffTkm;
      const marginM3 = baseTariffM3 - outgoingTariffM3;
      const marginM3km = baseTariffM3km - outgoingTariffM3km;

      recordsToCreate.push({
        distanceKm: km,
        baseTariffT,
        baseTariffTkm,
        baseTariffM3,
        baseTariffM3km,
        outgoingTariffT,
        outgoingTariffTkm,
        outgoingTariffM3,
        outgoingTariffM3km,
        marginT,
        marginTkm,
        marginM3,
        marginM3km,
        volumeCoeff,
        marginPercent,
      });
    }

    // Сохраняем батчами (upsert по distanceKm)
    const BATCH_SIZE = 100;
    let recordsGenerated = 0;

    for (let i = 0; i < recordsToCreate.length; i += BATCH_SIZE) {
      const batch = recordsToCreate.slice(i, i + BATCH_SIZE);
      
      await prisma.$transaction(
        batch.map((record) =>
          prisma.transportTariff.upsert({
            where: { distanceKm: record.distanceKm },
            update: record,
            create: record,
          })
        )
      );
      
      recordsGenerated += batch.length;
    }

    // Сохраняем параметры гиперболы в конфиг
    await prisma.transportTariffConfig.upsert({
      where: { id: 1 },
      update: {
        point1Km,
        point1Tariff,
        point2Km,
        point2Tariff,
        point3Km,
        point3Tariff,
        paramA: a,
        paramB: b,
        paramC: c,
        hyperMinKm,
        hyperMaxKm,
        volumeCoeff,
        marginPercent,
        maxDistanceKm,
      },
      create: {
        id: 1,
        point1Km,
        point1Tariff,
        point2Km,
        point2Tariff,
        point3Km,
        point3Tariff,
        paramA: a,
        paramB: b,
        paramC: c,
        hyperMinKm,
        hyperMaxKm,
        volumeCoeff,
        marginPercent,
        maxDistanceKm,
        startKm: point1Km,
        startTariff: point1Tariff,
        endKm: point3Km,
        endTariff: point3Tariff,
      },
    });

    return NextResponse.json({
      success: true,
      params: { a, b, c },
      recordsGenerated,
    });
  } catch (error) {
    console.error('Error generating hyperbolic tariffs:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при генерации тарифов' },
      { status: 500 }
    );
  }
}
