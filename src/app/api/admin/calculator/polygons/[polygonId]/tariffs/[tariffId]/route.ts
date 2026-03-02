import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/calculator/polygons/[polygonId]/tariffs/[tariffId]
 * Возвращает тариф с данными CargoItem
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ polygonId: string; tariffId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { polygonId, tariffId } = await params;

    if (!polygonId || !tariffId) {
      return NextResponse.json({ error: 'polygonId и tariffId обязательны' }, { status: 400 });
    }

    const tariff = await prisma.utilizationTariff.findUnique({
      where: { id: tariffId },
      include: {
        cargoItem: {
          select: {
            itemName: true,
            hazardClass: true,
          },
        },
      },
    });

    if (!tariff) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 404 });
    }

    return NextResponse.json({
      ...tariff,
      itemName: tariff.cargoItem?.itemName || null,
      hazardClass: tariff.cargoItem?.hazardClass || null,
    });
  } catch (error) {
    logger.error('Error fetching tariff:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении тарифа' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/calculator/polygons/[polygonId]/tariffs/[tariffId]
 * Обновить тариф
 * Body: { tariffRubT }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ polygonId: string; tariffId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { polygonId, tariffId } = await params;

    if (!polygonId || !tariffId) {
      return NextResponse.json({ error: 'polygonId и tariffId обязательны' }, { status: 400 });
    }

    const body = await request.json();
    const updateSchema = z.object({
      tariffRubT: z.number().positive('Тариф должен быть положительным'),
    });
    const validatedData = updateSchema.parse(body);

    // Проверяем существование тарифа по ID
    const existingTariff = await prisma.utilizationTariff.findUnique({
      where: { id: tariffId },
    });

    if (!existingTariff) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 404 });
    }

    const tariff = await prisma.utilizationTariff.update({
      where: { id: tariffId },
      data: {
        tariffRubT: validatedData.tariffRubT,
      },
    });

    return NextResponse.json({
      message: 'Тариф обновлён',
      tariff,
    });
  } catch (error) {
    logger.error('Error updating tariff:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении тарифа' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/calculator/polygons/[polygonId]/tariffs/[tariffId]
 * Удалить тариф
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ polygonId: string; tariffId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { polygonId, tariffId } = await params;

    if (!polygonId || !tariffId) {
      return NextResponse.json({ error: 'polygonId и tariffId обязательны' }, { status: 400 });
    }

    // Проверяем существование тарифа по ID
    const existingTariff = await prisma.utilizationTariff.findUnique({
      where: { id: tariffId },
    });

    if (!existingTariff) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 404 });
    }

    await prisma.utilizationTariff.delete({
      where: { id: tariffId },
    });

    return NextResponse.json({
      message: 'Тариф удалён',
    });
  } catch (error) {
    logger.error('Error deleting tariff:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении тарифа' },
      { status: 500 }
    );
  }
}
