import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDisposalSingle } from '@/lib/calculator/calculator.service';

const disposalSingleSchema = z.object({
  pickupCoords: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  fkkoCode: z.string().regex(/^\d{11}$/, 'fkkoCode должен быть строкой из 11 цифр'),
  volume: z.number().positive('volume должен быть больше 0'),
  unit: z.enum(['t', 'm3']),
  compaction: z.number().positive(),
  polygonId: z.string(),
});

/**
 * POST /api/calculator/calculate-disposal-single
 * Рассчитывает стоимость утилизации для конкретного полигона
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = disposalSingleSchema.parse(body);

    const result = await calculateDisposalSingle({
      pickupCoords: validatedData.pickupCoords,
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
    console.error('Error calculating disposal single:', error);

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
