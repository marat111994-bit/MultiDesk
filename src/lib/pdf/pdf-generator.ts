/**
 * Основной генератор PDF коммерческих предложений
 * Использует pdfkit для генерации PDF
 *
 * Макет: Форма Б (карточка + таблица)
 * - Строго 1 страница A4
 * - Компактный профессиональный B2B-документ
 * - Без эмодзи
 */
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { PdfData, PdfTransportData, PdfDisposalData } from './types';
import { PAGE, SPACING } from './pdf-styles';
import { drawHeader } from './sections/header';
import { drawTitle } from './sections/title';
import { drawInfoCard } from './sections/info-card';
import { drawTransportCostTable } from './sections/cost-table-transport';
import { drawDisposalCostTable } from './sections/cost-table-disposal';
import { drawTerms } from './sections/terms';
import { drawRequisites } from './sections/requisites';
import { drawFooter } from './sections/footer';
import path from 'path';

/**
 * Инициализация шрифтов
 */
function registerFonts(doc: InstanceType<typeof PDFDocument>): void {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  try {
    doc.registerFont('Regular', path.join(fontsDir, 'Roboto-Regular.ttf'));
    doc.registerFont('Bold', path.join(fontsDir, 'Roboto-Bold.ttf'));
    doc.registerFont('Light', path.join(fontsDir, 'Roboto-Light.ttf'));

    // Устанавливаем шрифт по умолчанию
    doc.font('Regular');
  } catch (error) {
    console.error('[PDF] Ошибка регистрации шрифтов:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Генерация PDF коммерческого предложения
 * @param data - Данные для генерации
 * @returns Buffer с PDF файлом
 */
export async function generatePdf(data: PdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Создание документа
      const doc = new PDFDocument({
        size: [PAGE.width, PAGE.height],
        margins: {
          top: PAGE.margin,
          bottom: PAGE.margin,
          left: PAGE.margin,
          right: PAGE.margin,
        },
      });

      // Регистрация шрифтов
      registerFonts(doc);

      // Сборка PDF в буфер
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === ГЕНЕРАЦИЯ СЕКЦИЙ ===
      let currentY = PAGE.margin;
      const contentWidth = PAGE.width - PAGE.margin * 2;

      // 1. ШАПКА (~60pt)
      drawHeader({
        doc,
        x: PAGE.margin,
        y: currentY,
        width: contentWidth,
      });
      currentY += 60 + SPACING.lg;

      // 2. ЗАГОЛОВОК (~35pt)
      drawTitle({
        doc,
        x: PAGE.margin,
        y: currentY,
        width: contentWidth,
        applicationNumber: data.applicationNumber,
        date: data.date,
        serviceType: data.type,
      });
      currentY += 35 + SPACING.xl;

      // 3. КАРТОЧКА ЗАЯВКИ (динамическая высота)
      const infoCardHeight = drawInfoCard({
        doc,
        x: PAGE.margin,
        y: currentY,
        width: contentWidth,
        data,
      });
      currentY += infoCardHeight + SPACING.lg;

      // 4. ТАБЛИЦА РАСЧЁТА СТОИМОСТИ
      let tableHeight: number;
      if (data.type === 'transport') {
        tableHeight = drawTransportCostTable({
          doc,
          x: PAGE.margin,
          y: currentY,
          width: contentWidth,
          data: data as PdfTransportData,
        });
      } else {
        tableHeight = drawDisposalCostTable({
          doc,
          x: PAGE.margin,
          y: currentY,
          width: contentWidth,
          data: data as PdfDisposalData,
        });
      }
      currentY += tableHeight + SPACING.lg;

      // 5. УСЛОВИЯ (~65pt — список из 5 пунктов)
      drawTerms({
        doc,
        x: PAGE.margin,
        y: currentY,
        width: contentWidth,
      });
      currentY += 65 + SPACING.md;

      // 6. РЕКВИЗИТЫ (~50pt)
      drawRequisites({
        doc,
        x: PAGE.margin,
        y: currentY,
        width: contentWidth,
      });
      currentY += 50 + SPACING.lg;

      // 7. ФУТЕР (одна строка внизу)
      drawFooter({
        doc,
        x: PAGE.margin,
        y: currentY,
        width: contentWidth,
      });

      // Завершение генерации
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Генерация PDF и возврат как stream
 * @param data - Данные для генерации
 * @returns Readable stream с PDF файлом
 */
export async function generatePdfStream(data: PdfData): Promise<Readable> {
  const buffer = await generatePdf(data);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Форматирование числа с разделителями тысяч
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Форматирование валюты (рубли)
 */
export function formatCurrency(value: number): string {
  return `${formatNumber(value)} ₽`;
}
