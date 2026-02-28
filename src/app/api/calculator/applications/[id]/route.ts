import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calculator/applications/[id]
 * Возвращает Calculation по id для страницы подтверждения
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID обязателен' },
        { status: 400 }
      );
    }

    const calculation = await prisma.calculation.findUnique({
      where: { id },
      select: {
        id: true,
        calculationId: true,
        serviceType: true,
        status: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
        companyName: true,
        companyInn: true,
        companyKpp: true,
        companyAddress: true,
        cargoName: true,
        cargoCode: true,
        fkkoCode: true,
        volume: true,
        unit: true,
        compaction: true,
        pickupAddress: true,
        pickupCoords: true,
        pickupMode: true,
        dropoffAddress: true,
        dropoffCoords: true,
        dropoffMode: true,
        polygonId: true,
        polygonName: true,
        polygonAddress: true,
        polygonCoords: true,
        distanceKm: true,
        transportTariff: true,
        transportPrice: true,
        utilizationTariff: true,
        utilizationPrice: true,
        totalPrice: true,
        comment: true,
        calculationData: true,
        pdfData: true,
        pdfPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заявки' },
      { status: 500 }
    );
  }
}
