import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateTransport } from '@/lib/calculator/calculator.service';

const transportSchema = z.object({
  pickupCoords: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  dropoffCoords: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  volume: z.number().positive('volume должен быть больше 0'),
  unit: z.enum(['t', 'm3']),
  compaction: z.number().positive(),
});

/**
 * POST /api/calculator/calculate-transport
 * Рассчитывает стоимость перевозки
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = transportSchema.parse(body);

    const result = await calculateTransport({
      pickupCoords: validatedData.pickupCoords,
      dropoffCoords: validatedData.dropoffCoords,
      volume: validatedData.volume,
      unit: validatedData.unit,
      compaction: validatedData.compaction,
    });

    return NextResponse.json({
      distanceKm: result.distanceKm,
      transportTariff: result.transportTariff,
      transportPrice: result.transportPrice,
      totalPrice: result.totalPrice,
      volumeT: result.volumeT,
      volumeM3: result.volumeM3,
    });
  } catch (error) {
    console.error('Error calculating transport:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при расчёте стоимости перевозки' },
      { status: 500 }
    );
  }
}
