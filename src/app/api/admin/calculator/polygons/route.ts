import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/calculator/polygons
 * Возвращает список Polygon с фильтрацией
 * Query params: search, isActive
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const isActiveParam = searchParams.get('isActive');

    const where: any = {};

    // Фильтр по статусу активности
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true';
    }

    // Поиск по текстовым полям
    if (search) {
      where.OR = [
        { receiverName: { contains: search } },
        { facilityAddress: { contains: search } },
        { region: { contains: search } },
        { polygonId: { contains: search } },
        { receiverInn: { contains: search } },
      ];
    }

    const polygons = await prisma.polygon.findMany({
      where,
      select: {
        id: true,
        polygonId: true,
        seqNo: true,
        receiverName: true,
        receiverInn: true,
        facilityAddress: true,
        facilityCoordinates: true,
        region: true,
        phone: true,
        email: true,
        kipNumber: true,
        fkkoCodes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            utilizationTariffs: true,
            calculations: true,
          },
        },
      },
      orderBy: { receiverName: 'asc' },
      take: 500,
    });

    return NextResponse.json(polygons);
  } catch (error) {
    console.error('Error fetching polygons:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении полигонов' },
      { status: 500 }
    );
  }
}
