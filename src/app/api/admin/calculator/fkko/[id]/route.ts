import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * PATCH /api/admin/calculator/fkko/[id]
 * Обновить запись CargoItem
 */
export async function PATCH(
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
    const body = await request.json();
    const { itemCode, categoryCode, itemName, fkkoCode, hazardClass } = body;

    // Найти существующую запись
    const existing = await prisma.cargoItem.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      );
    }

    // Проверка на дубликат itemCode (если изменяется)
    if (itemCode && itemCode !== existing.itemCode) {
      const duplicateByItemCode = await prisma.cargoItem.findUnique({
        where: { itemCode },
      });
      if (duplicateByItemCode) {
        return NextResponse.json(
          { error: 'Запись с таким itemCode уже существует' },
          { status: 409 }
        );
      }
    }

    // Проверка на дубликат fkkoCode (если изменяется и не null)
    if (fkkoCode !== undefined && fkkoCode !== existing.fkkoCode) {
      if (fkkoCode) {
        const duplicateByFkko = await prisma.cargoItem.findUnique({
          where: { fkkoCode },
        });
        if (duplicateByFkko && duplicateByFkko.id !== id) {
          return NextResponse.json(
            { error: 'Запись с таким кодом ФККО уже существует' },
            { status: 409 }
          );
        }
      }
    }

    const updated = await prisma.cargoItem.update({
      where: { id },
      data: {
        itemCode: itemCode?.trim() ?? existing.itemCode,
        categoryCode: categoryCode ?? existing.categoryCode,
        itemName: itemName?.trim() ?? existing.itemName,
        fkkoCode: fkkoCode?.trim() ?? existing.fkkoCode,
        hazardClass: hazardClass !== undefined ? (hazardClass ? parseInt(hazardClass, 10) : null) : existing.hazardClass,
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

    // Синхронизация не требуется - названия подтягиваются через JOIN
    // При обновлении CargoItem все JOIN-запросы автоматически получат новые данные

    return NextResponse.json({ item: updated });
  } catch (error) {
    logger.error('Error updating FKCO item:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении записи ФККО' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/calculator/fkko/[id]
 * Удалить запись CargoItem
 */
export async function DELETE(
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

    // Найти существующую запись
    const existing = await prisma.cargoItem.findUnique({
      where: { id },
      include: {
        utilizationTariffs: true,
      },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      );
    }

    // Проверка: используется ли в тарифах полигонов
    const tariffCount = existing.utilizationTariffs.length;
    let warning: string | undefined;
    if (tariffCount > 0) {
      warning = `Используется в ${tariffCount} тарифах полигонов`;
    }

    // Удалить запись (CASCADE удалит связи в utilizationTariffs)
    await prisma.cargoItem.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      warning,
    });
  } catch (error) {
    logger.error('Error deleting FKCO item:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении записи ФККО' },
      { status: 500 }
    );
  }
}
