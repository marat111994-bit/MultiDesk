import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/admin/calculator/applications/[id]/comments
 * Возвращает историю комментариев для заявки
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    // Проверяем существование заявки
    const calculation = await prisma.calculation.findUnique({
      where: { id },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    const comments = await prisma.calculationComment.findMany({
      where: { calculationId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении комментариев' },
      { status: 500 }
    );
  }
}

const createCommentSchema = z.object({
  comment: z.string().min(1, 'Комментарий не может быть пустым'),
  authorType: z.enum(['client', 'dispatcher']),
  authorName: z.string().optional(),
});

/**
 * POST /api/admin/calculator/applications/[id]/comments
 * Добавить комментарий к заявке
 * Body: { comment, authorType, authorName }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Проверяем существование заявки
    const calculation = await prisma.calculation.findUnique({
      where: { id },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    const comment = await prisma.calculationComment.create({
      data: {
        calculationId: id,
        comment: validatedData.comment,
        authorType: validatedData.authorType,
        authorName: validatedData.authorName || null,
      },
    });

    return NextResponse.json({
      message: 'Комментарий добавлен',
      comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при добавлении комментария' },
      { status: 500 }
    );
  }
}
