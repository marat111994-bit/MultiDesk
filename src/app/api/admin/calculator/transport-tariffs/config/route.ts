import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CONFIG_ID = 1;

/**
 * GET /api/admin/calculator/transport-tariffs/config
 * Вернуть TransportTariffConfig (singleton)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await prisma.transportTariffConfig.findUnique({
      where: { id: CONFIG_ID },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Конфигурация не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching transport tariff config:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении конфигурации' },
      { status: 500 }
    );
  }
}

const updateConfigSchema = z.object({
  startKm: z.number().positive(),
  startTariff: z.number().positive(),
  endKm: z.number().positive(),
  endTariff: z.number().positive(),
  volumeCoeff: z.number().positive().optional(),
  marginPercent: z.number().min(0).max(100).optional(),
  maxDistanceKm: z.number().positive(),
});

/**
 * PUT /api/admin/calculator/transport-tariffs/config
 * Обновить конфиг (upsert id=1)
 * Body: { startKm, startTariff, endKm, endTariff, volumeCoeff, marginPercent, maxDistanceKm }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateConfigSchema.parse(body);

    const config = await prisma.transportTariffConfig.upsert({
      where: { id: CONFIG_ID },
      update: {
        startKm: validatedData.startKm,
        startTariff: validatedData.startTariff,
        endKm: validatedData.endKm,
        endTariff: validatedData.endTariff,
        volumeCoeff: validatedData.volumeCoeff,
        marginPercent: validatedData.marginPercent,
        maxDistanceKm: validatedData.maxDistanceKm,
      },
      create: {
        id: CONFIG_ID,
        startKm: validatedData.startKm,
        startTariff: validatedData.startTariff,
        endKm: validatedData.endKm,
        endTariff: validatedData.endTariff,
        volumeCoeff: validatedData.volumeCoeff ?? 1.4,
        marginPercent: validatedData.marginPercent ?? 0,
        maxDistanceKm: validatedData.maxDistanceKm,
        point1Km: validatedData.startKm,
        point1Tariff: validatedData.startTariff,
        point2Km: validatedData.endKm,
        point2Tariff: validatedData.endTariff,
        point3Km: validatedData.endKm,
        point3Tariff: validatedData.endTariff,
      },
    });

    return NextResponse.json({
      message: 'Конфигурация обновлена',
      config,
    });
  } catch (error) {
    console.error('Error updating transport tariff config:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении конфигурации' },
      { status: 500 }
    );
  }
}
