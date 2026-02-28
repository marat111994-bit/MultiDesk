import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/admin/calculator/polygons/[polygonId]
 * Возвращает детали Polygon + все её UtilizationTariff
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ polygonId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { polygonId } = await params;

    if (!polygonId) {
      return NextResponse.json({ error: 'polygonId обязателен' }, { status: 400 });
    }

    const polygon = await prisma.polygon.findUnique({
      where: { polygonId },
      include: {
        utilizationTariffs: {
          orderBy: { fkkoCode: 'asc' },
        },
        _count: {
          select: {
            calculations: true,
          },
        },
      },
    });

    if (!polygon) {
      return NextResponse.json({ error: 'Полигон не найден' }, { status: 404 });
    }

    return NextResponse.json(polygon);
  } catch (error) {
    console.error('Error fetching polygon:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении полигона' },
      { status: 500 }
    );
  }
}

const updatePolygonSchema = z.object({
  receiverName: z.string().optional(),
  facilityAddress: z.string().optional(),
  facilityCoordinates: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/admin/calculator/polygons/[polygonId]
 * Обновить данные полигона
 * Body: { receiverName, facilityAddress, facilityCoordinates, region, phone, email, isActive }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ polygonId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { polygonId } = await params;

    if (!polygonId) {
      return NextResponse.json({ error: 'polygonId обязателен' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updatePolygonSchema.parse(body);

    // Проверяем существование полигона
    const existingPolygon = await prisma.polygon.findUnique({
      where: { polygonId },
    });

    if (!existingPolygon) {
      return NextResponse.json({ error: 'Полигон не найден' }, { status: 404 });
    }

    const polygon = await prisma.polygon.update({
      where: { polygonId },
      data: validatedData,
    });

    return NextResponse.json({
      message: 'Полигон обновлён',
      polygon,
    });
  } catch (error) {
    console.error('Error updating polygon:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении полигона' },
      { status: 500 }
    );
  }
}
