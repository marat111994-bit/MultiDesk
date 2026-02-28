import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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
    const session = await getServerSession(authOptions);
    if (!session) {
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

    // Проверяем существование тарифа
    const existingTariff = await prisma.utilizationTariff.findUnique({
      where: {
        fkkoCode_polygonId: {
          fkkoCode: tariffId, // tariffId это fkkoCode в составе уникального ключа
          polygonId,
        },
      },
    });

    if (!existingTariff) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 404 });
    }

    const tariff = await prisma.utilizationTariff.update({
      where: {
        fkkoCode_polygonId: {
          fkkoCode: tariffId,
          polygonId,
        },
      },
      data: {
        tariffRubT: validatedData.tariffRubT,
      },
    });

    return NextResponse.json({
      message: 'Тариф обновлён',
      tariff,
    });
  } catch (error) {
    console.error('Error updating tariff:', error);

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { polygonId, tariffId } = await params;

    if (!polygonId || !tariffId) {
      return NextResponse.json({ error: 'polygonId и tariffId обязательны' }, { status: 400 });
    }

    // Проверяем существование тарифа
    const existingTariff = await prisma.utilizationTariff.findUnique({
      where: {
        fkkoCode_polygonId: {
          fkkoCode: tariffId,
          polygonId,
        },
      },
    });

    if (!existingTariff) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 404 });
    }

    await prisma.utilizationTariff.delete({
      where: {
        fkkoCode_polygonId: {
          fkkoCode: tariffId,
          polygonId,
        },
      },
    });

    return NextResponse.json({
      message: 'Тариф удалён',
    });
  } catch (error) {
    console.error('Error deleting tariff:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении тарифа' },
      { status: 500 }
    );
  }
}
