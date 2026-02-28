import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/calculator/transport-tariffs
 * Возвращает тарифы на расстояние для превью (первые 30 км)
 * Query params: limit (по умолчанию 30)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const tariffs = await prisma.transportTariff.findMany({
      select: {
        distanceKm: true,
        baseTariffT: true,
        baseTariffM3: true,
      },
      orderBy: { distanceKm: 'asc' },
      take: limit,
    });

    return NextResponse.json(tariffs);
  } catch (error) {
    console.error('Error fetching transport tariffs:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении тарифов' },
      { status: 500 }
    );
  }
}
