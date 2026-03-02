import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/calculator/fkko/export
 * Экспорт всех CargoItem в CSV
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

    const items = await prisma.cargoItem.findMany({
      select: {
        itemCode: true,
        categoryCode: true,
        itemName: true,
        fkkoCode: true,
        hazardClass: true,
      },
      orderBy: { fkkoCode: 'asc' },
    });

    // Формирование CSV
    const headers = ['item_code', 'category_code', 'item_name', 'fkko_code', 'hazard_class'];
    const rows = items.map((item) =>
      [
        escapeCsvField(item.itemCode),
        escapeCsvField(item.categoryCode),
        escapeCsvField(item.itemName),
        escapeCsvField(item.fkkoCode || ''),
        item.hazardClass !== null && item.hazardClass !== undefined ? item.hazardClass.toString() : '',
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cargo_items_export.csv"',
      },
    });
  } catch (error) {
    logger.error('Error exporting FKCO:', error);
    return NextResponse.json(
      { error: 'Ошибка при экспорте ФККО' },
      { status: 500 }
    );
  }
}

function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = value.toString();
  // Если есть запятые, кавычки или переносы строк — экранировать
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
