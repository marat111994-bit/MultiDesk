import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/admin/calculator/polygons/[polygonId]/tariffs
 * Возвращает список UtilizationTariff для полигона
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

    // Проверяем существование полигона
    const polygon = await prisma.polygon.findUnique({
      where: { polygonId },
    });

    if (!polygon) {
      return NextResponse.json({ error: 'Полигон не найден' }, { status: 404 });
    }

    const tariffs = await prisma.utilizationTariff.findMany({
      where: { polygonId },
      orderBy: { fkkoCode: 'asc' },
    });

    return NextResponse.json(tariffs);
  } catch (error) {
    console.error('Error fetching tariffs:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении тарифов' },
      { status: 500 }
    );
  }
}

const createTariffSchema = z.object({
  fkkoCode: z.string().min(1, 'FKKO код обязателен'),
  tariffRubT: z.number().positive('Тариф должен быть положительным'),
});

/**
 * POST /api/admin/calculator/polygons/[polygonId]/tariffs
 * Добавить тариф к полигону
 * Body: { fkkoCode, tariffRubT }
 */
export async function POST(
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
    const validatedData = createTariffSchema.parse(body);

    // Проверяем существование полигона
    const polygon = await prisma.polygon.findUnique({
      where: { polygonId },
    });

    if (!polygon) {
      return NextResponse.json({ error: 'Полигон не найден' }, { status: 404 });
    }

    // Проверяем, существует ли уже такой тариф
    const existingTariff = await prisma.utilizationTariff.findUnique({
      where: {
        fkkoCode_polygonId: {
          fkkoCode: validatedData.fkkoCode,
          polygonId,
        },
      },
    });

    if (existingTariff) {
      return NextResponse.json(
        { error: 'Тариф с таким FKKO кодом уже существует для этого полигона' },
        { status: 409 }
      );
    }

    const tariff = await prisma.utilizationTariff.create({
      data: {
        fkkoCode: validatedData.fkkoCode,
        polygonId,
        tariffRubT: validatedData.tariffRubT,
      },
    });

    return NextResponse.json({
      message: 'Тариф добавлен',
      tariff,
    });
  } catch (error) {
    console.error('Error creating tariff:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при добавлении тарифа' },
      { status: 500 }
    );
  }
}
