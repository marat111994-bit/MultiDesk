import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCommercialOfferHtml, generatePdfWithPuppeteer } from '@/lib/pdf/generate-pdf';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/calculator/pdf/[id]
 * Генерация PDF коммерческого предложения
 * 
 * Зависимости (установить при необходимости):
 * npm install puppeteer-core
 * 
 * Для Railway: Puppeteer может быть недоступен, тогда возвращается HTML файл
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

    // 1. Найти Calculation по id
    const calculation = await prisma.calculation.findUnique({
      where: { id },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    // 2. Если pdfPath существует и файл есть → вернуть файл (кэш)
    if (calculation.pdfPath) {
      try {
        const filePath = path.isAbsolute(calculation.pdfPath)
          ? calculation.pdfPath
          : path.join(process.cwd(), calculation.pdfPath);
        
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (fileExists) {
          const fileBuffer = await fs.readFile(filePath);
          const isPdf = calculation.pdfPath.endsWith('.pdf');
          
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': isPdf ? 'application/pdf' : 'text/html; charset=utf-8',
              'Content-Disposition': `inline; filename="${path.basename(calculation.pdfPath)}"`,
            },
          });
        }
      } catch (error) {
        console.error('Error reading cached file:', error);
        // Продолжаем генерацию если файл не найден
      }
    }

    // 3. Генерация PDF/HTML
    // Парсим pdfData из JSON string
    let pdfData: Record<string, unknown> = {};
    if (calculation.pdfData) {
      try {
        pdfData = JSON.parse(calculation.pdfData);
      } catch {
        // Если pdfData не валидный JSON, используем данные из calculation
      }
    }

    // Формируем данные для генерации
    const data = {
      calculationId: calculation.calculationId,
      createdAt: calculation.createdAt.toISOString(),
      serviceType: calculation.serviceType,
      contactName: calculation.contactName,
      contactPhone: calculation.contactPhone,
      contactEmail: calculation.contactEmail,
      companyName: calculation.companyName,
      companyInn: calculation.companyInn,
      cargoName: calculation.cargoName,
      fkkoCode: calculation.fkkoCode,
      volume: calculation.volume,
      unit: calculation.unit,
      pickupAddress: calculation.pickupAddress,
      dropoffAddress: calculation.dropoffAddress,
      polygonName: calculation.polygonName,
      polygonAddress: calculation.polygonAddress,
      polygonCoords: calculation.polygonCoords,
      distanceKm: calculation.distanceKm,
      transportTariff: calculation.transportTariff,
      transportPrice: calculation.transportPrice,
      utilizationTariff: calculation.utilizationTariff,
      utilizationPrice: calculation.utilizationPrice,
      totalPrice: calculation.totalPrice,
    };

    // Генерируем HTML
    const html = generateCommercialOfferHtml(data, false);

    // Путь для сохранения
    const pdfDir = path.join(process.cwd(), 'tmp', 'pdf');
    await fs.mkdir(pdfDir, { recursive: true });

    let filePath: string;
    let fileBuffer: Buffer;
    let isPdf = false;

    try {
      // Пробуем сгенерировать PDF через Puppeteer
      fileBuffer = await generatePdfWithPuppeteer(html);
      filePath = path.join(pdfDir, `КП-${calculation.calculationId}.pdf`);
      isPdf = true;
    } catch (error) {
      // Puppeteer недоступен - генерируем HTML
      console.log('Puppeteer unavailable, generating HTML instead');
      fileBuffer = Buffer.from(html, 'utf-8');
      filePath = path.join(pdfDir, `КП-${calculation.calculationId}.html`);
      isPdf = false;
    }

    // Сохраняем файл
    await fs.writeFile(filePath, fileBuffer);

    // Обновляем Calculation.pdfPath
    await prisma.calculation.update({
      where: { id },
      data: { pdfPath: filePath },
    });

    // Возвращаем файл (конвертируем Buffer в Uint8Array для NextResponse)
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': isPdf ? 'application/pdf' : 'text/html; charset=utf-8',
        'Content-Disposition': isPdf 
          ? `inline; filename="КП-${calculation.calculationId}.pdf"`
          : `attachment; filename="КП-${calculation.calculationId}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Ошибка при генерации PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
