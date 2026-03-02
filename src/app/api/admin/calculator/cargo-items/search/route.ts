import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/calculator/cargo-items/search?q=текст&limit=10
 * Поиск грузов по коду ФККО или названию (публичный endpoint для калькулятора)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    logger.info('cargo-search: params', { q, limit });

    if (q.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    const items = await prisma.cargoItem.findMany({
      where: {
        OR: [
          { fkkoCode: { startsWith: q } },
          { itemName: { contains: q } },
        ],
      },
      select: {
        fkkoCode: true,
        itemName: true,
        categoryCode: true,
        hazardClass: true,
      },
      take: limit,
    });

    logger.info('cargo-search: result', { count: items.length });
    return NextResponse.json(items);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('cargo-search: error', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { error: 'Ошибка при поиске грузов', details: errorMessage },
      { status: 500 }
    );
  }
}
