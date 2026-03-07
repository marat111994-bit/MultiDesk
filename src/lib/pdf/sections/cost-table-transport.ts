/**
 * Секция 4A: ТАБЛИЦА РАСЧЁТА СТОИМОСТИ
 * Форма 1 — Перевозка (только транспорт)
 * 
 * Колонки: № | Услуга | Объём | Тариф | Плечо | Стоимость | Итого
 */
import PDFDocument from 'pdfkit';
import { COLORS, FONT_SIZE, SPACING } from '../pdf-styles';
import { PdfTransportData } from '../types';

interface TransportTableOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
  data: PdfTransportData;
}

/**
 * Форматирование числа с разделителями
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Форматирование валюты
 */
function formatCurrency(value: number): string {
  return `${formatNumber(value)} ₽`;
}

/**
 * Отрисовка таблицы расчёта для перевозки
 */
export function drawTransportCostTable({
  doc,
  x,
  y,
  width,
  data,
}: TransportTableOptions): number {
  // Заголовок секции
  doc
    .font('Bold')
    .fontSize(10)
    .fillColor(COLORS.heading)
    .text('Расчёт стоимости', x, y);

  const tableTopY = y + 20;

  // Конфигурация колонок (6 колонок)
  const columns = [
    { key: 'number', width: 30, align: 'center' as const },
    { key: 'service', width: width * 0.35, align: 'left' as const },
    { key: 'volume', width: width * 0.12, align: 'right' as const },
    { key: 'tariff', width: width * 0.15, align: 'right' as const },
    { key: 'distance', width: width * 0.12, align: 'right' as const },
    { key: 'cost', width: width * 0.16, align: 'right' as const },
  ];

  const headerHeight = 22;
  const headerY = tableTopY;

  // Заголовки колонок
  const headers = [
    { text: '№', width: columns[0].width },
    { text: 'УСЛУГА', width: columns[1].width },
    { text: 'ОБЪЁМ', width: columns[2].width },
    { text: 'ТАРИФ', width: columns[3].width },
    { text: 'ПЛЕЧО', width: columns[4].width },
    { text: 'СТОИМОСТЬ', width: columns[5].width },
  ];

  // Фон заголовков
  doc
    .fillColor(COLORS.tableHeader)
    .rect(x, headerY, width, headerHeight)
    .fill();

  // Текст заголовков
  let currentX = x + SPACING.sm;
  headers.forEach((header, index) => {
    const col = columns[index];
    const padding = 4;

    doc
      .font('Bold')
      .fontSize(7.5)
      .fillColor(COLORS.tableHeaderText)
      .text(header.text, currentX + padding, headerY + 5, {
        width: header.width - padding * 2,
        align: col.align,
      });

    currentX += header.width;
  });

  // Данные для строки
  const distanceText = `${formatNumber(data.route.distance)} км`;
  const volumeText = `${formatNumber(data.cargo.volume)} ${data.cargo.unit}`;
  const tariffText = `${formatNumber(data.pricing.tariffPerTKm)} ₽/т×км / ${formatNumber(data.pricing.tariffPerT)} ₽/т`;
  const costText = formatCurrency(data.pricing.totalCost);

  // Формируем название услуги с ФККО
  let serviceText = data.cargo.name;
  if (data.cargo.fkkoCode) {
    serviceText += `, ФККО ${data.cargo.fkkoCode}`;
  }

  // Вычисляем высоту строки данных с учётом переноса текста
  const dataCells = [
    { text: '1', width: columns[0].width },
    { text: serviceText, width: columns[1].width },
    { text: volumeText, width: columns[2].width },
    { text: tariffText, width: columns[3].width },
    { text: distanceText, width: columns[4].width },
    { text: costText, width: columns[5].width },
  ];

  const padding = 8;
  const cellHeights = dataCells.map((cell, index) => {
    if (index === 0) return 20; // Номер строки фиксированная высота
    return doc.heightOfString(cell.text, {
      width: cell.width - padding,
      lineBreak: true,
    });
  });

  const maxCellHeight = Math.max(...cellHeights);
  const rowHeight = Math.max(maxCellHeight + 10, 26); // Минимум 26pt
  const dataY = headerY + headerHeight;

  // Отрисовка ячеек строки данных
  currentX = x + SPACING.sm;
  dataCells.forEach((cell, index) => {
    const col = columns[index];
    const cellPadding = 4;
    const alignY = index === 0 
      ? dataY + 5 
      : dataY + 5 + (maxCellHeight - cellHeights[index]) / 2;

    doc
      .font('Regular')
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(cell.text, currentX + cellPadding, alignY, {
        width: cell.width - cellPadding * 2,
        align: col.align,
        lineBreak: index !== 0,
      });

    currentX += cell.width;
  });

  // Горизонтальная линия после строки данных
  const lineY = dataY + rowHeight;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(x, lineY)
    .lineTo(x + width, lineY)
    .stroke();

  // Строка ИТОГО
  const totalY = lineY + 4;
  const totalHeight = 28;

  // Фон строки итого
  doc
    .fillColor(COLORS.tableTotalBg)
    .rect(x, totalY, width, totalHeight)
    .fill();

  // Текст "ИТОГО"
  const totalLabelWidth = width - columns[5].width - SPACING.sm * 2;
  doc
    .font('Bold')
    .fontSize(9.5)
    .fillColor(COLORS.tableTotalText)
    .text('ИТОГО:', x + SPACING.sm, totalY + 6, {
      width: totalLabelWidth,
      align: 'right',
    });

  // Сумма итого
  doc
    .font('Bold')
    .fontSize(9.5)
    .fillColor(COLORS.tableTotalText)
    .text(costText, x + width - columns[5].width, totalY + 6, {
      width: columns[5].width - SPACING.sm,
      align: 'right',
    });

  // Возвращаем общую высоту таблицы
  return totalY + totalHeight - y;
}
