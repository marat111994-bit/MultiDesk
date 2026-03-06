import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/calculator/polygons/create
 * Создает новый полигон с автоматической генерацией ID
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
    const {
      receiverName,
      receiverInn,
      facilityAddress,
      facilityCoordinates,
      region,
      phone,
      email,
      kipNumber,
      isActive,
    } = body;

    // Валидация обязательных полей
    if (!receiverName || !receiverName.trim()) {
      return NextResponse.json(
        { error: 'Название обязательно' },
        { status: 400 }
      );
    }
    if (!facilityAddress || !facilityAddress.trim()) {
      return NextResponse.json(
        { error: 'Адрес обязателен' },
        { status: 400 }
      );
    }
    if (!facilityCoordinates || !facilityCoordinates.trim()) {
      return NextResponse.json(
        { error: 'Координаты обязательны' },
        { status: 400 }
      );
    }

    // Валидация формата координат
    const coordsPattern = /^\d+\.\d+\s+\d+\.\d+$/;
    if (!coordsPattern.test(facilityCoordinates)) {
      return NextResponse.json(
        { error: 'Неверный формат координат. Используйте формат: широта пробел долгота (55.438062 37.656374)' },
        { status: 400 }
      );
    }

    // Находим максимальный ID среди существующих полигонов
    const lastPolygon = await prisma.polygon.findFirst({
      where: {
        polygonId: {
          startsWith: 'POLY_',
        },
      },
      orderBy: {
        polygonId: 'desc',
      },
      select: {
        polygonId: true,
        seqNo: true,
      },
    });

    // Вычисляем новый ID
    let newSeqNo = 1;
    if (lastPolygon && lastPolygon.polygonId) {
      const lastNum = parseInt(lastPolygon.polygonId.replace('POLY_', ''), 10);
      newSeqNo = lastNum + 1;
    } else if (lastPolygon?.seqNo) {
      newSeqNo = lastPolygon.seqNo + 1;
    }

    const newId = `POLY_${String(newSeqNo).padStart(3, '0')}`;

    // Создаем новый полигон
    const polygon = await prisma.polygon.create({
      data: {
        polygonId: newId,
        seqNo: newSeqNo,
        receiverName: receiverName.trim(),
        receiverInn: receiverInn?.trim() || null,
        facilityAddress: facilityAddress.trim(),
        facilityCoordinates: facilityCoordinates.trim(),
        region: region?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        kipNumber: kipNumber?.trim() || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      polygonId: polygon.polygonId,
    });
  } catch (error) {
    logger.error('Error creating polygon:', error);
    
    // Обработка ошибки уникальности
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Полигон с таким ID уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при создании полигона' },
      { status: 500 }
    );
  }
}
