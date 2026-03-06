import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/calculator/cargo-items/search?q=текст&limit=10
 * Поиск грузов по коду ФККО или названию (публичный endpoint для калькулятора)
 * Поиск регистронезависимый
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

    // Для SQLite используем фильтрацию на стороне приложения для регистронезависимости
    const items = await prisma.cargoItem.findMany({
      select: {
        fkkoCode: true,
        itemName: true,
        categoryCode: true,
        hazardClass: true,
      },
      take: limit * 2, // Берём с запасом для фильтрации
    });

    // Фильтрация на стороне приложения (регистронезависимая)
    const qLower = q.toLowerCase();
    const filtered = items
      .filter((item) => {
        const fkkoMatch = item.fkkoCode?.toLowerCase().startsWith(qLower);
        const nameMatch = item.itemName.toLowerCase().includes(qLower);
        return fkkoMatch || nameMatch;
      })
      .slice(0, limit);

    logger.info('cargo-search: result', { count: filtered.length });
    return NextResponse.json(filtered);
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
