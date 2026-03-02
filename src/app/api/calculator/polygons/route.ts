import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/calculator/polygons?search=...
 * Возвращает активные Polygon с фильтрацией по search
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const polygons = await prisma.polygon.findMany({
      where: { isActive: true },
      select: {
        polygonId: true,
        receiverName: true,
        facilityAddress: true,
        facilityCoordinates: true,
        region: true,
      },
      orderBy: { receiverName: 'asc' },
      take: 100,
    });

    // Фильтрация на стороне приложения для SQLite
    if (!search) {
      return NextResponse.json(polygons);
    }

    const filtered = polygons.filter(
      (p) =>
        p.receiverName.toLowerCase().includes(search.toLowerCase()) ||
        p.facilityAddress.toLowerCase().includes(search.toLowerCase())
    );

    return NextResponse.json(filtered);
  } catch (error) {
    logger.error('polygons: error', { message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Ошибка при получении полигонов' },
      { status: 500 }
    );
  }
}
