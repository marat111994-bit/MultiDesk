import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/calculator/polygons/search?search=...
 * Поиск полигонов по всем полям, кроме fkkoCodes
 * Возвращает ВСЕ полигоны из базы (без фильтра по isActive)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    logger.info('polygons-search: params', { search, limit });

    if (search.length < 2) {
      // Если поиска нет — возвращаем все полигоны
      const polygons = await prisma.polygon.findMany({
        select: {
          polygonId: true,
          receiverName: true,
          receiverInn: true,
          facilityAddress: true,
          facilityCoordinates: true,
          region: true,
          phone: true,
          email: true,
          kipNumber: true,
        },
        orderBy: { receiverName: 'asc' },
        take: limit,
      });

      return NextResponse.json(polygons);
    }

    // Получаем все полигоны для фильтрации на стороне приложения
    const polygons = await prisma.polygon.findMany({
      select: {
        polygonId: true,
        receiverName: true,
        receiverInn: true,
        facilityAddress: true,
        facilityCoordinates: true,
        region: true,
        phone: true,
        email: true,
        kipNumber: true,
      },
      orderBy: { receiverName: 'asc' },
      take: limit * 2, // Берём с запасом для фильтрации
    });

    // Фильтрация на стороне приложения (регистронезависимая)
    const searchLower = search.toLowerCase();
    const filtered = polygons
      .filter((p) => {
        const fieldsToSearch = [
          p.receiverName,
          p.receiverInn || '',
          p.facilityAddress,
          p.region || '',
          p.phone || '',
          p.email || '',
          p.kipNumber || '',
        ];
        return fieldsToSearch.some((field) =>
          field.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, limit);

    logger.info('polygons-search: result', { count: filtered.length });
    return NextResponse.json(filtered);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('polygons-search: error', { message: errorMessage });
    return NextResponse.json(
      { error: 'Ошибка при поиске полигонов' },
      { status: 500 }
    );
  }
}
