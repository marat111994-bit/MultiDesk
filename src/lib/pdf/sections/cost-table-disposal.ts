/**
 * Секция 4B: ТАБЛИЦА РАСЧЁТА СТОИМОСТИ
 * Форма 2 — Перевозка + утилизация
 * 
 * Колонки: № | Услуга | Груз | Объём | Плечо | Цена за ед. | Итого
 */
import PDFDocument from 'pdfkit';
import { COLORS, FONT_SIZE, SPACING } from '../pdf-styles';
import { PdfDisposalData } from '../types';

interface DisposalTableOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
  data: PdfDisposalData;
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
 * Отрисовка таблицы расчёта для перевозки + утилизации
 */
export function drawDisposalCostTable({
  doc,
  x,
  y,
  width,
  data,
}: DisposalTableOptions): number {
  // Заголовок секции
  doc
    .font('Bold')
    .fontSize(10)
    .fillColor(COLORS.heading)
    .text('Расчёт стоимости', x, y);

  const tableTopY = y + 20;

  // Конфигурация колонок (7 колонок)
  const columns = [
    { key: 'number', width: 30, align: 'center' as const },
    { key: 'service', width: width * 0.15, align: 'left' as const },
    { key: 'cargo', width: width * 0.28, align: 'left' as const },
    { key: 'volume', width: width * 0.1, align: 'right' as const },
    { key: 'distance', width: width * 0.1, align: 'right' as const },
    { key: 'price', width: width * 0.17, align: 'right' as const },
    { key: 'total', width: width * 0.15, align: 'right' as const },
  ];

  const headerHeight = 22;
  const headerY = tableTopY;

  // Заголовки колонок
  const headers = [
    { text: '№', width: columns[0].width },
    { text: 'УСЛУГА', width: columns[1].width },
    { text: 'ГРУЗ', width: columns[2].width },
    { text: 'ОБЪЁМ', width: columns[3].width },
    { text: 'ПЛЕЧО', width: columns[4].width },
    { text: 'ЦЕНА ЗА ЕД.', width: columns[5].width },
    { text: 'ИТОГО', width: columns[6].width },
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

  // Формируем название груза с ФККО
  let cargoName = data.cargo.name;
  if (data.cargo.fkkoCode) {
    cargoName += `, ФККО ${data.cargo.fkkoCode}`;
  }

  const volumeText = `${formatNumber(data.cargo.volume)} ${data.cargo.unit}`;
  const distanceText = `${formatNumber(data.route.distance)} км`;

  // Данные для строки 1: Перевозка
  const transportPriceText = `${formatNumber(data.pricing.transport.tariffPerT)} ₽/т (${formatNumber(data.pricing.transport.tariffPerTKm)} ₽/т×км)`;
  const transportTotalText = formatCurrency(data.pricing.transport.cost);

  // Данные для строки 2: Утилизация
  const disposalPriceText = `${formatNumber(data.pricing.disposal.tariffPerT)} ₽/т`;
  const disposalTotalText = formatCurrency(data.pricing.disposal.cost);

  // Вычисляем высоту строк с учётом переноса текста
  const padding = 8;

  // Строка 1: Перевозка
  const transportCells = [
    { text: '1', width: columns[0].width },
    { text: 'Перевозка', width: columns[1].width },
    { text: cargoName, width: columns[2].width },
    { text: volumeText, width: columns[3].width },
    { text: distanceText, width: columns[4].width },
    { text: transportPriceText, width: columns[5].width },
    { text: transportTotalText, width: columns[6].width },
  ];

  const transportCellHeights = transportCells.map((cell, index) => {
    if (index === 0 || index === 1 || index === 3 || index === 4 || index === 6) {
      return 20; // Фиксированная высота для коротких ячеек
    }
    return doc.heightOfString(cell.text, {
      width: cell.width - padding,
      lineBreak: true,
    });
  });

  const transportMaxHeight = Math.max(...transportCellHeights);
  const transportRowHeight = Math.max(transportMaxHeight + 10, 26);
  const dataY = headerY + headerHeight;

  // Отрисовка строки 1: Перевозка
  currentX = x + SPACING.sm;
  transportCells.forEach((cell, index) => {
    const col = columns[index];
    const cellPadding = 4;
    const isFixedHeight = index === 0 || index === 1 || index === 3 || index === 4 || index === 6;
    const alignY = isFixedHeight 
      ? dataY + 5 
      : dataY + 5 + (transportMaxHeight - transportCellHeights[index]) / 2;

    doc
      .font('Regular')
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(cell.text, currentX + cellPadding, alignY, {
        width: cell.width - cellPadding * 2,
        align: col.align,
        lineBreak: !isFixedHeight,
      });

    currentX += cell.width;
  });

  // Горизонтальная линия после строки 1
  const line1Y = dataY + transportRowHeight;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(x, line1Y)
    .lineTo(x + width, line1Y)
    .stroke();

  // Строка 2: Утилизация
  const disposalY = line1Y;

  const disposalCells = [
    { text: '2', width: columns[0].width },
    { text: 'Утилизация', width: columns[1].width },
    { text: cargoName, width: columns[2].width },
    { text: volumeText, width: columns[3].width },
    { text: '—', width: columns[4].width },
    { text: disposalPriceText, width: columns[5].width },
    { text: disposalTotalText, width: columns[6].width },
  ];

  const disposalCellHeights = disposalCells.map((cell, index) => {
    if (index === 0 || index === 1 || index === 3 || index === 4 || index === 5 || index === 6) {
      return 20;
    }
    return doc.heightOfString(cell.text, {
      width: cell.width - padding,
      lineBreak: true,
    });
  });

  const disposalMaxHeight = Math.max(...disposalCellHeights);
  const disposalRowHeight = Math.max(disposalMaxHeight + 10, 26);

  // Отрисовка строки 2: Утилизация
  currentX = x + SPACING.sm;
  disposalCells.forEach((cell, index) => {
    const col = columns[index];
    const cellPadding = 4;
    const isFixedHeight = index !== 2;
    const alignY = isFixedHeight 
      ? disposalY + 5 
      : disposalY + 5 + (disposalMaxHeight - disposalCellHeights[index]) / 2;

    doc
      .font('Regular')
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(cell.text, currentX + cellPadding, alignY, {
        width: cell.width - cellPadding * 2,
        align: col.align,
        lineBreak: !isFixedHeight,
      });

    currentX += cell.width;
  });

  // Горизонтальная линия после строки 2
  const line2Y = disposalY + disposalRowHeight;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(x, line2Y)
    .lineTo(x + width, line2Y)
    .stroke();

  // Строка ИТОГО
  const totalY = line2Y + 4;
  const totalHeight = 28;

  // Фон строки итого
  doc
    .fillColor(COLORS.tableTotalBg)
    .rect(x, totalY, width, totalHeight)
    .fill();

  // Текст "ИТОГО"
  const totalLabelWidth = width - columns[6].width - SPACING.sm * 2;
  doc
    .font('Bold')
    .fontSize(9.5)
    .fillColor(COLORS.tableTotalText)
    .text('ИТОГО:', x + SPACING.sm, totalY + 6, {
      width: totalLabelWidth,
      align: 'right',
    });

  // Сумма итого
  const totalCostText = formatCurrency(data.pricing.totalCost);
  doc
    .font('Bold')
    .fontSize(9.5)
    .fillColor(COLORS.tableTotalText)
    .text(totalCostText, x + width - columns[6].width, totalY + 6, {
      width: columns[6].width - SPACING.sm,
      align: 'right',
    });

  // Возвращаем общую высоту таблицы
  return totalY + totalHeight - y;
}
