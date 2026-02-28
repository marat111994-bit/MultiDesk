import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const generateTariffSchema = z.object({
  startKm: z.number().positive(),
  startTariff: z.number().positive(),
  endKm: z.number().positive(),
  endTariff: z.number().positive(),
  volumeCoeff: z.number().positive(),
  marginPercent: z.number().min(0).max(100),
  maxDistanceKm: z.number().positive(),
});

/**
 * Линейная интерполяция тарифа
 * tariff(km) = startTariff + (endTariff - startTariff) * (km - startKm) / (endKm - startKm)
 */
function linearInterpolation(
  km: number,
  startKm: number,
  startTariff: number,
  endKm: number,
  endTariff: number
): number {
  if (km <= startKm) return startTariff;
  if (km >= endKm) return endTariff;
  
  const ratio = (km - startKm) / (endKm - startKm);
  return startTariff + (endTariff - startTariff) * ratio;
}

/**
 * POST /api/admin/calculator/transport-tariffs/generate
 * Генерирует линейную матрицу тарифов
 * Body: { startKm, startTariff, endKm, endTariff, volumeCoeff, marginPercent, maxDistanceKm }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateTariffSchema.parse(body);

    const {
      startKm,
      startTariff,
      endKm,
      endTariff,
      volumeCoeff,
      marginPercent,
      maxDistanceKm,
    } = validatedData;

    const marginMultiplier = 1 - marginPercent / 100;
    const recordsToCreate = [];

    // Генерируем тарифы для каждого км от 1 до maxDistanceKm
    for (let km = 1; km <= maxDistanceKm; km++) {
      // Базовый тариф за км (линейная интерполяция)
      const baseTariffTkm = linearInterpolation(km, startKm, startTariff, endKm, endTariff);
      
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
      
      // Используем транзакцию для батча
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

    return NextResponse.json({
      success: true,
      recordsGenerated,
    });
  } catch (error) {
    console.error('Error generating transport tariffs:', error);

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
