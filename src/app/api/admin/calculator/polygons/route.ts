import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/calculator/polygons
 * Возвращает список Polygon с фильтрацией
 * Query params: search, isActive
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
    const isActiveParam = searchParams.get('isActive');

    const where: any = {};

    // Фильтр по статусу активности
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true';
    }

    // Поиск по текстовым полям
    if (search) {
      // Разбиваем поисковый запрос на слова для более гибкого поиска
      const searchWords = search.trim().split(/\s+/).filter(Boolean);
      
      where.OR = [
        // Поиск по полному названию (не чувствительный к регистру)
        { receiverName: { contains: search, mode: 'insensitive' } },
        { facilityAddress: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { polygonId: { contains: search, mode: 'insensitive' } },
        { receiverInn: { contains: search, mode: 'insensitive' } },
        // Поиск по названию без кавычек и "ООО"/"ИП"
        { receiverName: { contains: search.replace(/["']/g, '').replace(/^(ООО|ИП|АО|ПАО)\s*/i, ''), mode: 'insensitive' } },
      ];

      // Если поисковых слов несколько, добавляем поиск по каждому слову
      if (searchWords.length > 1) {
        searchWords.forEach(word => {
          if (word.length >= 2) {
            where.OR.push(
              { receiverName: { contains: word, mode: 'insensitive' } },
              { facilityAddress: { contains: word, mode: 'insensitive' } },
              { region: { contains: word, mode: 'insensitive' } }
            );
          }
        });
      }
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
    logger.error('Error fetching polygons:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении полигонов' },
      { status: 500 }
    );
  }
}
