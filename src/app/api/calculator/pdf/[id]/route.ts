import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePdf } from '@/lib/pdf/pdf-generator';
import { PdfTransportData, PdfDisposalData } from '@/lib/pdf/types';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';

/**
 * GET /api/calculator/pdf/[id]
 * Генерация PDF коммерческого предложения через pdfkit
 *
 * Возвращает PDF файл с коммерческим предложением
 * - Форма 1: Перевозка (только транспорт)
 * - Форма 2: Перевозка + утилизация
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID обязателен' },
        { status: 400 }
      );
    }

    // 1. Найти Calculation по id (UUID или calculationId)
    let calculation = await prisma.calculation.findUnique({
      where: { id },
    });

    // Если не найдено по UUID, пробуем найти по calculationId
    if (!calculation) {
      calculation = await prisma.calculation.findUnique({
        where: { calculationId: id },
      });
    }

    if (!calculation) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    // 2. Если pdfPath существует и файл есть → вернуть файл (кэш)
    if (calculation.pdfPath && calculation.pdfPath.endsWith('.pdf')) {
      try {
        const filePath = path.isAbsolute(calculation.pdfPath)
          ? calculation.pdfPath
          : path.join(process.cwd(), calculation.pdfPath);

        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

        if (fileExists) {
          const fileBuffer = await fs.readFile(filePath);

          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${path.basename(calculation.pdfPath)}"`,
            },
          });
        }
      } catch (error) {
        logger.error('pdf/[id]: error reading cached file', {
          message: error instanceof Error ? error.message : String(error)
        });
        // Продолжаем генерацию если файл не найден
      }
    }

    // 3. Подготовка данных для генерации PDF
    const pdfData = preparePdfData(calculation);

    // 4. Генерация PDF через pdfkit
    const pdfBuffer = await generatePdf(pdfData);

    // 5. Сохранение файла
    const pdfDir = path.join(process.cwd(), 'tmp', 'pdf');
    await fs.mkdir(pdfDir, { recursive: true });

    const fileName = `КП-${calculation.calculationId}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    // 6. Обновление записи в БД
    await prisma.calculation.update({
      where: { id: calculation.id },
      data: { pdfPath: filePath },
    });

    // 7. Возврат PDF клиенту
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });

  } catch (error) {
    logger.error('pdf/[id]: error generating PDF', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Ошибка при генерации PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Подготовка данных для генерации PDF из модели Calculation
 */
function preparePdfData(calculation: {
  calculationId: string;
  serviceType: string;
  createdAt: Date;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  companyName?: string | null;
  companyInn?: string | null;
  companyKpp?: string | null;
  cargoName?: string | null;
  cargoCode?: string | null;
  fkkoCode?: string | null;
  volume?: number | null;
  unit?: string | null;
  compaction?: number | null;
  pickupAddress?: string | null;
  pickupMode?: string | null;
  pickupCoords?: string | null;
  dropoffAddress?: string | null;
  dropoffMode?: string | null;
  dropoffCoords?: string | null;
  polygonId?: string | null;
  polygonName?: string | null;
  polygonAddress?: string | null;
  polygonCoords?: string | null;
  distanceKm?: number | null;
  transportTariff?: number | null;
  transportTariffPerKm?: number | null;
  transportPrice?: number | null;
  utilizationTariff?: number | null;
  utilizationPrice?: number | null;
  totalPrice?: number | null;
}): PdfTransportData | PdfDisposalData {
  const isDisposal = (calculation.serviceType || '').includes('disposal');

  const baseData = {
    applicationNumber: calculation.calculationId,
    date: calculation.createdAt.toISOString(),
    cargo: {
      name: calculation.cargoName || 'Груз',
      fkkoCode: calculation.fkkoCode || undefined,
      volume: calculation.volume || 0,
      unit: calculation.unit || 'т',
      compactionCoefficient: calculation.compaction || undefined,
    },
  };

  // Вычисляем тарифы
  // transportTariffPerKm — это тариф за т×км
  // transportTariff — это тариф за т (или итоговый)
  const tariffPerTKm = calculation.transportTariffPerKm || 0;
  const distance = calculation.distanceKm || 0;
  
  // Если tariffPerT не указан, вычисляем его как tariffPerTKm × distance
  let tariffPerT = calculation.transportTariff || 0;
  if (!tariffPerT && tariffPerTKm && distance) {
    tariffPerT = tariffPerTKm * distance;
  }

  if (isDisposal) {
    // Форма 2: Перевозка + утилизация
    const data: PdfDisposalData = {
      type: 'transport-disposal',
      ...baseData,
      route: {
        loadingAddress: calculation.pickupAddress || '',
        loadingMode: calculation.pickupMode || undefined,
        polygonName: calculation.polygonName || '',
        polygonAddress: calculation.polygonAddress || '',
        unloadingMode: calculation.dropoffMode || undefined,
        distance: calculation.distanceKm || 0,
        mapUrl: buildYandexMapsUrl(calculation.polygonCoords),
      },
      pricing: {
        transport: {
          tariffPerTKm: tariffPerTKm,
          tariffPerT: tariffPerT,
          cost: calculation.transportPrice || 0,
        },
        disposal: {
          tariffPerT: calculation.utilizationTariff || 0,
          cost: calculation.utilizationPrice || 0,
        },
        totalCost: calculation.totalPrice || 0,
      },
    };
    return data;
  } else {
    // Форма 1: Только перевозка
    const data: PdfTransportData = {
      type: 'transport',
      ...baseData,
      route: {
        loadingAddress: calculation.pickupAddress || '',
        loadingMode: calculation.pickupMode || undefined,
        unloadingAddress: calculation.dropoffAddress || '',
        unloadingMode: calculation.dropoffMode || undefined,
        distance: calculation.distanceKm || 0,
        mapUrl: buildYandexMapsUrl(calculation.dropoffCoords || calculation.polygonCoords),
      },
      pricing: {
        tariffPerTKm: tariffPerTKm,
        tariffPerT: tariffPerT,
        totalCost: calculation.totalPrice || 0,
      },
    };
    return data;
  }
}

/**
 * Построение URL для Яндекс.Карт
 */
function buildYandexMapsUrl(coords?: string | null): string | undefined {
  if (!coords) return undefined;

  const parts = coords.split(',');
  if (parts.length < 2) return undefined;

  const lat = parts[0].trim();
  const lon = parts[1].trim();

  return `https://yandex.ru/maps/?pt=${lon},${lat}&z=15&l=map`;
}
