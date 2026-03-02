import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDisposalAuto } from '@/lib/calculator/calculator.service';
import { logger } from '@/lib/logger';

const disposalSchema = z.object({
  pickupCoords: z.string().or(z.object({ lat: z.number(), lon: z.number() })),
  fkkoCode: z.string().regex(/^\d{11}$/, 'fkkoCode должен быть строкой из 11 цифр'),
  volume: z.number().positive('volume должен быть больше 0'),
  unit: z.string().transform((val) => val?.toLowerCase() as 't' | 'm3').pipe(z.enum(['t', 'm3'])),
  compaction: z.number().positive(),
});

function parseCoords(coords: string | { lat: number; lon: number }): { lat: number; lon: number } {
  if (typeof coords === 'string') {
    // Поддерживаем форматы: "lat lon" (пробел), "lat,lon" (запятая), "lat, lon" (запятая+пробел)
    let parts: string[];
    if (coords.includes(',')) {
      parts = coords.split(',').map((s) => s.trim());
    } else {
      parts = coords.split(' ').map((s) => s.trim());
    }
    const lat = Number(parts[0]);
    const lon = Number(parts[1]);
    if (parts.length !== 2 || isNaN(lat) || isNaN(lon)) {
      throw new Error('Неверный формат координат');
    }
    return { lat, lon };
  }
  return coords;
}

/**
 * POST /api/calculator/calculate-disposal
 * Рассчитывает стоимость утилизации с авто-выбором полигонов (топ-5)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== CALCULATE-DISPOSAL REQUEST BODY ===');
    console.log(JSON.stringify(body, null, 2));

    const validatedData = disposalSchema.parse(body);

    const pickupCoords = parseCoords(validatedData.pickupCoords);

    logger.info('calculate-disposal: request', { pickupCoords, fkkoCode: validatedData.fkkoCode, volume: validatedData.volume })

    const result = await calculateDisposalAuto({
      pickupCoords,
      fkkoCode: validatedData.fkkoCode,
      volume: validatedData.volume,
      unit: validatedData.unit,
      compaction: validatedData.compaction,
    });

    logger.info('calculate-disposal: result', { options: result.options?.length })

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('=== CALCULATE-DISPOSAL ERROR ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', JSON.stringify(error.meta));
    console.error('Stack:', error.stack);

    if (error instanceof z.ZodError) {
      console.error('=== ZOD VALIDATION ISSUES ===');
      console.error(JSON.stringify(error.issues, null, 2));
      
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('calculate-disposal: error', {
      message: error instanceof Error ? error.message : String(error),
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    return NextResponse.json(
      { error: 'Ошибка поиска полигонов', details: error.message },
      { status: 500 }
    );
  }
}
