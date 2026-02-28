import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDisposalAuto } from '@/lib/calculator/calculator.service';

const disposalSchema = z.object({
  pickupCoords: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  fkkoCode: z.string().regex(/^\d{11}$/, 'fkkoCode должен быть строкой из 11 цифр'),
  volume: z.number().positive('volume должен быть больше 0'),
  unit: z.enum(['t', 'm3']),
  compaction: z.number().positive(),
});

/**
 * POST /api/calculator/calculate-disposal
 * Рассчитывает стоимость утилизации с авто-выбором полигонов (топ-5)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = disposalSchema.parse(body);

    const result = await calculateDisposalAuto({
      pickupCoords: validatedData.pickupCoords,
      fkkoCode: validatedData.fkkoCode,
      volume: validatedData.volume,
      unit: validatedData.unit,
      compaction: validatedData.compaction,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating disposal:', error);

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
