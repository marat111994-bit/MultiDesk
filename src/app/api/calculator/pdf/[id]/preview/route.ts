import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCommercialOfferHtml } from '@/lib/pdf/generate-pdf';

/**
 * GET /api/calculator/pdf/[id]/preview
 * Возвращает HTML-превью коммерческого предложения для просмотра в браузере
 * 
 * В отличие от основного endpoint, этот:
 * - Всегда возвращает HTML (не PDF)
 * - Содержит кнопку "Распечатать" с window.print()
 * - Не сохраняет файл на диск
 * - Не обновляет pdfPath в БД
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

    // Найти Calculation по id
    const calculation = await prisma.calculation.findUnique({
      where: { id },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    // Формируем данные для генерации
    const data = {
      calculationId: calculation.calculationId,
      createdAt: calculation.createdAt.toISOString(),
      serviceType: calculation.serviceType,
      contactName: calculation.contactName,
      contactPhone: calculation.contactPhone,
      contactEmail: calculation.contactEmail,
      companyName: calculation.companyName,
      companyInn: calculation.companyInn,
      cargoName: calculation.cargoName,
      fkkoCode: calculation.fkkoCode,
      volume: calculation.volume,
      unit: calculation.unit,
      pickupAddress: calculation.pickupAddress,
      dropoffAddress: calculation.dropoffAddress,
      polygonName: calculation.polygonName,
      polygonAddress: calculation.polygonAddress,
      polygonCoords: calculation.polygonCoords,
      distanceKm: calculation.distanceKm,
      transportTariff: calculation.transportTariff,
      transportPrice: calculation.transportPrice,
      utilizationTariff: calculation.utilizationTariff,
      utilizationPrice: calculation.utilizationPrice,
      totalPrice: calculation.totalPrice,
    };

    // Генерируем HTML с кнопкой печати
    const html = generateCommercialOfferHtml(data, true);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Ошибка при генерации превью', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
