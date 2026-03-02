import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const applicationSchema = z.object({
  serviceType: z.enum(['transport', 'transport_disposal_auto', 'transport_disposal_manual']),
  companyName: z.string().nullish(),
  companyInn: z.string().nullish(),
  contactName: z.string().nullish(),
  contactPhone: z.string().nullish(),
  contactEmail: z.string().nullish(),
  cargoName: z.string().nullish(),
  cargoCode: z.string().nullish(),
  fkkoCode: z.string().nullish(),
  volume: z.number().nullish(),
  unit: z.string().nullish(),
  compaction: z.number().nullish(),
  pickupAddress: z.string().nullish(),
  pickupCoords: z.string().nullish(),
  pickupMode: z.string().nullish(),
  // polygon или dropoff поля
  polygonId: z.string().nullish(),
  polygonName: z.string().nullish(),
  polygonAddress: z.string().nullish(),
  polygonCoords: z.string().nullish(),
  dropoffAddress: z.string().nullish(),
  dropoffCoords: z.string().nullish(),
  dropoffMode: z.string().nullish(),
  // расчётные данные
  distanceKm: z.number().nullish(),
  transportTariff: z.number().nullish(),
  transportPrice: z.number().nullish(),
  utilizationTariff: z.number().nullish(),
  utilizationPrice: z.number().nullish(),
  totalPrice: z.number().nullish(),
  calculationData: z.record(z.string(), z.unknown()).nullish(),
  pdfData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Генерирует calculationId формата "CD-ДДММГГ-NNN"
 */
async function generateCalculationId(): Promise<string> {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const datePart = `${day}${month}${year}`;

  // Считаем количество расчётов за сегодня
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.calculation.count({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const sequenceNumber = String(count + 1).padStart(3, '0');
  return `CD-${datePart}-${sequenceNumber}`;
}

/**
 * POST /api/calculator/applications
 * Сохраняет заявку в таблицу Calculation
 */
export async function POST(request: NextRequest) {
  let rawBody: Record<string, any> | null = null;
  
  try {
    rawBody = await request.json();

    logger.info('applications: received body', rawBody);

    if (!rawBody) {
      throw new Error('Empty request body');
    }

    // Приводим числовые поля явно
    const safeBody = {
      ...rawBody,
      volume: Number(rawBody.volume) || 0,
      compaction: Number(rawBody.compaction) || 1.4,
      distanceKm: Number(rawBody.distanceKm) || 0,
      transportPrice: Number(rawBody.transportPrice) || 0,
      utilizationPrice: Number(rawBody.utilizationPrice) || 0,
      totalPrice: Number(rawBody.totalPrice) || 0,
      transportTariff: Number(rawBody.transportTariff) || 0,
      utilizationTariff: Number(rawBody.utilizationTariff) || 0,
      // Координаты — строки, но не должны быть undefined
      pickupCoords: rawBody.pickupCoords || '',
      dropoffCoords: rawBody.dropoffCoords ?? null,
      polygonCoords: rawBody.polygonCoords ?? null,
    };

    const validatedData = applicationSchema.parse(safeBody);

    // Генерируем уникальный ID
    const calculationId = await generateCalculationId();

    // Сохраняем в базу
    const calculation = await prisma.calculation.create({
      data: {
        calculationId,
        serviceType: validatedData.serviceType,
        contactName: validatedData.contactName || null,
        contactPhone: validatedData.contactPhone || null,
        contactEmail: validatedData.contactEmail || null,
        companyName: validatedData.companyName || null,
        companyInn: validatedData.companyInn || null,
        cargoName: validatedData.cargoName || null,
        cargoCode: validatedData.cargoCode || null,
        fkkoCode: validatedData.fkkoCode || null,
        volume: validatedData.volume || null,
        unit: validatedData.unit || null,
        compaction: validatedData.compaction || null,
        pickupAddress: validatedData.pickupAddress || null,
        pickupCoords: validatedData.pickupCoords || null,
        pickupMode: validatedData.pickupMode || null,
        polygonId: validatedData.polygonId || null,
        polygonName: validatedData.polygonName || null,
        polygonAddress: validatedData.polygonAddress || null,
        polygonCoords: validatedData.polygonCoords || null,
        dropoffAddress: validatedData.dropoffAddress || null,
        dropoffCoords: validatedData.dropoffCoords || null,
        dropoffMode: validatedData.dropoffMode || null,
        distanceKm: validatedData.distanceKm || null,
        transportTariff: validatedData.transportTariff || null,
        transportPrice: validatedData.transportPrice || null,
        utilizationTariff: validatedData.utilizationTariff || null,
        utilizationPrice: validatedData.utilizationPrice || null,
        totalPrice: validatedData.totalPrice || null,
        calculationData: validatedData.calculationData
          ? JSON.stringify(validatedData.calculationData)
          : null,
        pdfData: validatedData.pdfData
          ? JSON.stringify(validatedData.pdfData)
          : null,
        status: 'draft',
      },
    });

    return NextResponse.json({
      id: calculation.id,
      calculationId: calculation.calculationId,
      message: 'Заявка сохранена',
    });
  } catch (error: any) {
    logger.error('applications: error', { 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: error?.code,
      meta: error?.meta,
    });

    if (error instanceof z.ZodError) {
      logger.error('applications: validation errors', { issues: error.issues, body: rawBody });
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при сохранении заявки', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
