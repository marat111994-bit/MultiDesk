import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/calculator/fkko/import
 * Импорт CargoItem из CSV
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'add';

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не загружен' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV файл пуст или содержит только заголовок' },
        { status: 400 }
      );
    }

    // Парсинг заголовка
    const headerLine = lines[0];
    const headers = parseCsvLine(headerLine);
    const expectedHeaders = ['item_code', 'category_code', 'item_name', 'fkko_code', 'hazard_class'];
    
    // Проверка заголовков
    const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Отсутствуют колонки: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    const headerIndex = Object.fromEntries(
      expectedHeaders.map((h) => [h, headers.indexOf(h)])
    );

    // Режим replace: удалить все существующие записи
    if (mode === 'replace') {
      await prisma.cargoItem.deleteMany({});
    }

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    // Парсинг строк данных
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        
        const itemCode = values[headerIndex.item_code]?.trim() || '';
        const categoryCode = values[headerIndex.category_code]?.trim() || 'OSSG';
        const itemName = values[headerIndex.item_name]?.trim() || '';
        const fkkoCode = values[headerIndex.fkko_code]?.trim() || null;
        const hazardClassStr = values[headerIndex.hazard_class]?.trim() || '';
        const hazardClass = hazardClassStr ? parseInt(hazardClassStr, 10) : null;

        if (!itemCode || !itemName) {
          errors.push(`Строка ${i + 1}: пустые item_code или item_name`);
          continue;
        }

        // Проверка категории
        const validCategories = ['OSSG', 'NO_OSSG', 'INERT', 'SNOW'];
        if (!validCategories.includes(categoryCode)) {
          errors.push(`Строка ${i + 1}: неверная категория "${categoryCode}"`);
          continue;
        }

        // Проверка класса опасности
        if (hazardClass !== null && (hazardClass < 1 || hazardClass > 5)) {
          errors.push(`Строка ${i + 1}: неверный класс опасности "${hazardClass}"`);
          continue;
        }

        // Режим add: пропустить если уже существует
        if (mode === 'add') {
          const existing = await prisma.cargoItem.findUnique({
            where: { itemCode },
          });
          if (existing) {
            continue; // Пропустить существующую запись
          }
        }

        // Режим upsert: обновить или создать
        if (mode === 'upsert') {
          const existing = await prisma.cargoItem.findUnique({
            where: { itemCode },
          });
          if (existing) {
            await prisma.cargoItem.update({
              where: { itemCode },
              data: {
                categoryCode,
                itemName,
                fkkoCode: fkkoCode || null,
                hazardClass,
              },
            });
            updated++;
            continue;
          }
        }

        // Создать новую запись
        await prisma.cargoItem.create({
          data: {
            itemCode,
            categoryCode,
            itemName,
            fkkoCode: fkkoCode || null,
            hazardClass,
          },
        });
        imported++;
      } catch (error: any) {
        errors.push(`Строка ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      imported,
      updated,
      errors: errors.length,
      errorDetails: errors.slice(0, 100), // Ограничим количество деталей ошибок
    });
  } catch (error: any) {
    logger.error('Error importing FKCO:', error);
    return NextResponse.json(
      { error: 'Ошибка при импорте ФККО: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Парсинг CSV строки с учётом кавычек
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Экранированная кавычка
        current += '"';
        i++; // Пропустить следующую кавычку
      } else if (char === '"') {
        // Конец кавычек
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Начало кавычек
        inQuotes = true;
      } else if (char === ',') {
        // Конец поля
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}
