import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calculator/cargo-items/[categoryCode]
 * Возвращает CargoItem по categoryCode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryCode: string }> }
) {
  try {
    const { categoryCode } = await params;

    if (!categoryCode) {
      return NextResponse.json(
        { error: 'categoryCode обязателен' },
        { status: 400 }
      );
    }

    const cargoItems = await prisma.cargoItem.findMany({
      where: { categoryCode },
      select: {
        itemCode: true,
        itemName: true,
        fkkoCode: true,
        hazardClass: true,
      },
      orderBy: { itemName: 'asc' },
    });

    return NextResponse.json(cargoItems);
  } catch (error) {
    console.error('Error fetching cargo items:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении номенклатуры грузов' },
      { status: 500 }
    );
  }
}
