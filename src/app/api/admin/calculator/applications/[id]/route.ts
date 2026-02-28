import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/admin/calculator/applications/[id]
 * Возвращает полные данные Calculation включая calculationData и pdfData
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    const calculation = await prisma.calculation.findUnique({
      where: { id },
      include: {
        polygon: true,
      },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Парсим JSON поля
    const parsedCalculationData = calculation.calculationData
      ? JSON.parse(calculation.calculationData)
      : null;
    const parsedPdfData = calculation.pdfData
      ? JSON.parse(calculation.pdfData)
      : null;

    return NextResponse.json({
      ...calculation,
      calculationData: parsedCalculationData,
      pdfData: parsedPdfData,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заявки' },
      { status: 500 }
    );
  }
}

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'completed', 'cancelled']),
});

/**
 * PATCH /api/admin/calculator/applications/[id]
 * Обновить статус заявки
 * Body: { status }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    const calculation = await prisma.calculation.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
    });

    return NextResponse.json({
      message: 'Статус обновлён',
      calculation: {
        id: calculation.id,
        calculationId: calculation.calculationId,
        status: calculation.status,
      },
    });
  } catch (error) {
    console.error('Error updating application status:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении статуса' },
      { status: 500 }
    );
  }
}
