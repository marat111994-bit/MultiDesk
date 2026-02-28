import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/calculator/transport-tariffs/check
 * Проверка данных в БД
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'count';

    if (action === 'count') {
      const count = await prisma.transportTariff.count();
      return NextResponse.json({ count });
    }

    if (action === 'sample') {
      const sample = await prisma.transportTariff.findMany({
        take: 10,
        orderBy: { distanceKm: 'asc' },
      });
      return NextResponse.json({ sample });
    }

    if (action === 'config') {
      const config = await prisma.transportTariffConfig.findUnique({
        where: { id: 1 },
      });
      return NextResponse.json({ config });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error checking transport tariffs:', error);
    return NextResponse.json(
      { error: 'Ошибка при проверке данных' },
      { status: 500 }
    );
  }
}
