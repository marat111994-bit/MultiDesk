/**
 * Секция 2: ЗАГОЛОВОК документа
 * "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ" + номер + тип услуги
 */
import PDFDocument from 'pdfkit';
import { COLORS, FONT_SIZE, SPACING } from '../pdf-styles';

interface TitleOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
  applicationNumber: string;
  date: string;
  serviceType: 'transport' | 'transport-disposal';
}

/**
 * Форматирование даты в формате ДД.ММ.ГГ
 */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

/**
 * Отрисовка заголовка документа
 */
export function drawTitle({
  doc,
  x,
  y,
  width,
  applicationNumber,
  date,
  serviceType,
}: TitleOptions): void {
  const centerX = x + width / 2;

  // Главный заголовок
  doc
    .font('Bold')
    .fontSize(13)
    .fillColor(COLORS.heading)
    .text('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', x, y, {
      width,
      align: 'center',
    });

  const subtitleY = y + 20;

  // Номер и дата
  const numberText = `№ ${applicationNumber} от ${formatDate(date)}`;

  // Тип услуги
  const serviceTypeText = serviceType === 'transport'
    ? 'Перевозка'
    : 'Перевозка и утилизация';

  // Разделитель — точка
  const separator = ' · ';
  const fullSubtitle = `${numberText}${separator}${serviceTypeText}`;

  doc
    .font('Regular')
    .fontSize(9)
    .fillColor(COLORS.textLight)
    .text(fullSubtitle, x, subtitleY, {
      width,
      align: 'center',
    });
}
