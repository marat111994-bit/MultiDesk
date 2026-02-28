import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/calculator/applications
 * Возвращает список Calculation с фильтрацией и пагинацией
 * Query params: search, serviceType, status, dateFrom, dateTo, polygonId, limit, offset
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
    const search = searchParams.get('search') || '';
    const serviceType = searchParams.get('serviceType') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const polygonId = searchParams.get('polygonId') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Построение where условия
    const where: any = {};

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (status) {
      where.status = status;
    }

    if (polygonId) {
      where.polygonId = polygonId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Добавляем конец дня для dateTo
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Поиск по текстовым полям (search)
    if (search) {
      const searchLower = search.toLowerCase();
      // Для SQLite используем contains для простого поиска
      where.OR = [
        { companyName: { contains: search } },
        { contactName: { contains: search } },
        { calculationId: { contains: search } },
        { cargoName: { contains: search } },
      ];
    }

    // Получаем данные с пагинацией
    const [calculations, total] = await Promise.all([
      prisma.calculation.findMany({
        where,
        select: {
          id: true,
          calculationId: true,
          serviceType: true,
          status: true,
          companyName: true,
          totalPrice: true,
          createdAt: true,
          contactName: true,
          polygonId: true,
          cargoName: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.calculation.count({ where }),
    ]);

    return NextResponse.json({
      data: calculations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + calculations.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заявок' },
      { status: 500 }
    );
  }
}
