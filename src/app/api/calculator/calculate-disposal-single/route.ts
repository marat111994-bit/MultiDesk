import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDisposalSingle } from '@/lib/calculator/calculator.service';
import { logger } from '@/lib/logger';

const disposalSingleSchema = z.object({
  pickupCoords: z.string().or(z.object({ lat: z.number(), lon: z.number() })),
  fkkoCode: z.string().regex(/^\d{11}$/, 'fkkoCode должен быть строкой из 11 цифр'),
  volume: z.number().positive('volume должен быть больше 0'),
  unit: z.enum(['t', 'm3']),
  compaction: z.number().positive(),
  polygonId: z.string(),
});

function parseCoords(coords: string | { lat: number; lon: number }): { lat: number; lon: number } {
  if (typeof coords === 'string') {
    const [lat, lon] = coords.split(',').map(Number);
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Неверный формат координат');
    }
    return { lat, lon };
  }
  return coords;
}

/**
 * POST /api/calculator/calculate-disposal-single
 * Рассчитывает стоимость утилизации для конкретного полигона
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = disposalSingleSchema.parse(body);

    const pickupCoords = parseCoords(validatedData.pickupCoords);

    const result = await calculateDisposalSingle({
      pickupCoords,
      fkkoCode: validatedData.fkkoCode,
      volume: validatedData.volume,
      unit: validatedData.unit,
      compaction: validatedData.compaction,
      polygonId: validatedData.polygonId,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Полигон не найден или неактивен' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('calculate-disposal-single: error', { message: error instanceof Error ? error.message : String(error) });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при расчёте стоимости утилизации' },
      { status: 500 }
    );
  }
}
