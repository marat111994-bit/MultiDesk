/**
 * Секция 3: ПАРАМЕТРЫ ЗАЯВКИ
 * Компактный key-value блок без QR-кода
 * Полное название груза с переносом
 */
import PDFDocument from 'pdfkit';
import { COLORS, FONT_SIZE, SPACING } from '../pdf-styles';
import { PdfTransportData, PdfDisposalData } from '../types';

interface InfoCardOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
  data: PdfTransportData | PdfDisposalData;
}

/**
 * Отрисовка карточки заявки
 * @returns Высота карточки
 */
export function drawInfoCard({ doc, x, y, width, data }: InfoCardOptions): number {
  const labelWidth = 100;
  const valueWidth = width - labelWidth - SPACING.lg * 2;
  const lineHeight = 14;

  // Формируем строки параметров
  const rows: Array<{ label: string; value: string }> = [];

  // Адрес погрузки
  rows.push({
    label: 'Адрес погрузки:',
    value: data.route.loadingAddress,
  });

  // Адрес выгрузки или полигон
  if (data.type === 'transport-disposal') {
    const disposalData = data as PdfDisposalData;
    rows.push({
      label: 'Полигон:',
      value: `${disposalData.route.polygonName} — ${disposalData.route.polygonAddress}`,
    });
  } else {
    const transportData = data as PdfTransportData;
    rows.push({
      label: 'Адрес выгрузки:',
      value: transportData.route.unloadingAddress,
    });
  }

  // Расстояние
  rows.push({
    label: 'Расстояние:',
    value: `${new Intl.NumberFormat('ru-RU').format(data.route.distance)} км`,
  });

  // Груз (полное название, с переносом)
  rows.push({
    label: 'Груз:',
    value: data.cargo.name,
  });

  // ФККО (если есть)
  if (data.cargo.fkkoCode) {
    rows.push({
      label: 'ФККО:',
      value: data.cargo.fkkoCode,
    });
  }

  // Объём
  const volumeText = `${new Intl.NumberFormat('ru-RU').format(data.cargo.volume)} ${data.cargo.unit}`;
  rows.push({
    label: 'Объём:',
    value: volumeText,
  });

  // Вычисляем высоту карточки динамически
  const baseHeight = SPACING.lg * 2; // padding сверху и снизу
  const labelHeight = 12; // высота заголовка секции
  const rowHeights = rows.map((row, index) => {
    // Для груза вычисляем высоту с учётом переноса
    if (row.label === 'Груз:') {
      const textHeight = doc.heightOfString(row.value, {
        width: valueWidth,
        lineBreak: true,
      });
      return Math.max(textHeight, lineHeight);
    }
    return lineHeight;
  });

  const totalContentHeight = rowHeights.reduce((sum, h) => sum + h, 0);
  const gapsHeight = (rows.length - 1) * 4; // 4pt между строками
  const cardHeight = baseHeight + labelHeight + totalContentHeight + gapsHeight + SPACING.lg;

  // Фон карточки
  doc
    .roundedRect(x, y, width, cardHeight, 3)
    .fillColor(COLORS.infoBg)
    .fill();

  // Рамка карточки
  doc
    .roundedRect(x, y, width, cardHeight, 3)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  // Заголовок секции
  doc
    .font('Bold')
    .fontSize(10)
    .fillColor(COLORS.heading)
    .text('Параметры заявки', x + SPACING.lg, y + SPACING.lg);

  // Отрисовка строк
  let currentY = y + SPACING.lg + labelHeight + SPACING.md;

  rows.forEach((row, index) => {
    const rowHeight = rowHeights[index];

    // Лейбл
    doc
      .font('Bold')
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .text(row.label, x + SPACING.lg, currentY, {
        width: labelWidth,
        align: 'left',
      });

    // Значение
    doc
      .font('Regular')
      .fontSize(8.5)
      .fillColor(COLORS.text)
      .text(row.value, x + SPACING.lg + labelWidth, currentY, {
        width: valueWidth,
        align: 'left',
        lineBreak: true,
      });

    currentY += rowHeight + 4; // 4pt gap между строками
  });

  return cardHeight;
}
