import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calculator/cargo-categories
 * Возвращает все CargoCategory из БД
 */
export async function GET() {
  try {
    const categories = await prisma.cargoCategory.findMany({
      select: {
        id: true,
        categoryCode: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching cargo categories:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении категорий грузов' },
      { status: 500 }
    );
  }
}
