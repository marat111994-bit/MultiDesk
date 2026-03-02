import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateTransport } from '@/lib/calculator/calculator.service';
import { logger } from '@/lib/logger';

const transportSchema = z.object({
  pickupCoords: z.string().min(1, 'Координаты погрузки обязательны').or(z.object({ lat: z.number(), lon: z.number() })),
  dropoffCoords: z.string().min(1, 'Координаты выгрузки обязательны').or(z.object({ lat: z.number(), lon: z.number() })),
  volume: z.number().positive('volume должен быть больше 0'),
  unit: z.enum(['t', 'm3']),
  compaction: z.number().positive(),
});

function parseCoords(coords: string | { lat: number; lon: number }): { lat: number; lon: number } {
  if (typeof coords === 'string') {
    console.log('parseCoords: received string coords:', JSON.stringify(coords));
    // Поддерживаем оба формата: "55.7558 37.6173" (пробел) и "55.7558,37.6173" (запятая)
    let parts: string[];
    if (coords.includes(',')) {
      parts = coords.split(',').map(p => p.trim());
    } else {
      // Разбиваем по любому количеству пробелов/табуляций
      parts = coords.trim().split(/\s+/);
    }
    console.log('parseCoords: parts:', parts);
    const lat = Number(parts[0]);
    const lon = Number(parts[1]);
    console.log('parseCoords: lat:', lat, 'lon:', lon, 'isNaN:', isNaN(lat), isNaN(lon));
    if (isNaN(lat) || isNaN(lon) || parts.length < 2) {
      throw new Error('Неверный формат координат');
    }
    return { lat, lon };
  }
  return coords;
}

/**
 * POST /api/calculator/calculate-transport
 * Рассчитывает стоимость перевозки
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('calculate-transport: raw body', body);

    // Приводим числовые поля явно
    const safeBody = {
      ...body,
      volume: Number(body.volume) || 0,
      compaction: Number(body.compaction) || 1.4,
      // Координаты — строки, но не должны быть undefined
      pickupCoords: body.pickupCoords || '',
      dropoffCoords: body.dropoffCoords || '',
    };

    logger.info('calculate-transport: safeBody', safeBody);

    const validatedData = transportSchema.parse(safeBody);

    logger.info('calculate-transport: validated data', { 
      pickupCoords: validatedData.pickupCoords, 
      dropoffCoords: validatedData.dropoffCoords,
      volume: validatedData.volume, 
      unit: validatedData.unit 
    });

    const pickupCoords = parseCoords(validatedData.pickupCoords);
    const dropoffCoords = parseCoords(validatedData.dropoffCoords);

    logger.info('calculate-transport: parsed coords', { pickupCoords, dropoffCoords })

    const result = await calculateTransport({
      pickupCoords,
      dropoffCoords,
      volume: validatedData.volume,
      unit: validatedData.unit,
      compaction: validatedData.compaction,
    });

    logger.info('calculate-transport: result', { distanceKm: result.distanceKm, totalPrice: result.totalPrice })

    return NextResponse.json({
      distanceKm: result.distanceKm,
      transportTariff: result.transportTariff,
      transportPrice: result.transportPrice,
      totalPrice: result.totalPrice,
      volumeT: result.volumeT,
      volumeM3: result.volumeM3,
    });
  } catch (error) {
    logger.error('calculate-transport: error', { message: error instanceof Error ? error.message : String(error) });

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
