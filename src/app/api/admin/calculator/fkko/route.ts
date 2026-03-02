import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/calculator/fkko
 * Возвращает список CargoItem с фильтрацией и пагинацией
 * Query params: search, category, hazardClass, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    logger.info('FKCO API: token exists:', !!token);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const hazardClass = searchParams.get('hazardClass') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    logger.info(`FKCO API: search=${search}, category=${category}, hazardClass=${hazardClass}, page=${page}, limit=${limit}`);

    const where: any = {};

    // Фильтр по категории
    if (category) {
      where.categoryCode = category;
    }

    // Фильтр по классу опасности
    if (hazardClass) {
      where.hazardClass = parseInt(hazardClass, 10);
    }

    // Поиск по коду ФККО или названию
    if (search) {
      where.OR = [
        { fkkoCode: { contains: search } },
        { itemName: { contains: search } },
        { itemCode: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.cargoItem.findMany({
        where,
        select: {
          id: true,
          itemCode: true,
          categoryCode: true,
          itemName: true,
          fkkoCode: true,
          hazardClass: true,
        },
        skip,
        take: limit,
        orderBy: { fkkoCode: 'asc' },
      }),
      prisma.cargoItem.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    logger.info(`FKCO API: returned ${items.length} items, total=${total}`);

    return NextResponse.json({
      items,
      total,
      page,
      pages,
    });
  } catch (error) {
    logger.error('Error fetching FKCO:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении записей ФККО' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/calculator/fkko
 * Создать новую запись CargoItem
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemCode, categoryCode, itemName, fkkoCode, hazardClass } = body;

    // Валидация
    if (!itemCode || !categoryCode || !itemName) {
      return NextResponse.json(
        { error: 'Обязательные поля: itemCode, categoryCode, itemName' },
        { status: 400 }
      );
    }

    // Проверка на дубликат itemCode
    const existingByItemCode = await prisma.cargoItem.findUnique({
      where: { itemCode },
    });
    if (existingByItemCode) {
      return NextResponse.json(
        { error: 'Запись с таким itemCode уже существует' },
        { status: 409 }
      );
    }

    // Проверка на дубликат fkkoCode (если указан)
    if (fkkoCode) {
      const existingByFkko = await prisma.cargoItem.findUnique({
        where: { fkkoCode },
      });
      if (existingByFkko) {
        return NextResponse.json(
          { error: 'Запись с таким кодом ФККО уже существует' },
          { status: 409 }
        );
      }
    }

    const item = await prisma.cargoItem.create({
      data: {
        itemCode: itemCode.trim(),
        categoryCode,
        itemName: itemName.trim(),
        fkkoCode: fkkoCode?.trim() || null,
        hazardClass: hazardClass ? parseInt(hazardClass, 10) : null,
      },
      select: {
        id: true,
        itemCode: true,
        categoryCode: true,
        itemName: true,
        fkkoCode: true,
        hazardClass: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    logger.error('Error creating FKCO item:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании записи ФККО' },
      { status: 500 }
    );
  }
}
