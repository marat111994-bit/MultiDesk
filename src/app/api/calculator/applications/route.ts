import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const applicationSchema = z.object({
  serviceType: z.string(),
  companyName: z.string().optional(),
  companyInn: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  cargoName: z.string().optional(),
  cargoCode: z.string().optional(),
  volume: z.number().optional(),
  unit: z.string().optional(),
  compaction: z.number().optional(),
  pickupAddress: z.string().optional(),
  pickupCoords: z.string().optional(),
  pickupMode: z.string().optional(),
  // polygon или dropoff поля
  polygonId: z.string().optional(),
  polygonName: z.string().optional(),
  polygonAddress: z.string().optional(),
  polygonCoords: z.string().optional(),
  dropoffAddress: z.string().optional(),
  dropoffCoords: z.string().optional(),
  dropoffMode: z.string().optional(),
  // расчётные данные
  distanceKm: z.number().optional(),
  transportTariff: z.number().optional(),
  transportPrice: z.number().optional(),
  utilizationTariff: z.number().optional(),
  utilizationPrice: z.number().optional(),
  totalPrice: z.number().optional(),
  calculationData: z.record(z.string(), z.unknown()).optional(),
  pdfData: z.record(z.string(), z.unknown()).optional(),
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
  try {
    const body = await request.json();

    const validatedData = applicationSchema.parse(body);

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
  } catch (error) {
    console.error('Error saving application:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при сохранении заявки' },
      { status: 500 }
    );
  }
}
