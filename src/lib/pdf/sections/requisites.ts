/**
 * Секция 6: РЕКВИЗИТЫ ИСПОЛНИТЕЛЯ
 * Только название и ИНН/КПП/ОГРН (без банковских реквизитов)
 */
import PDFDocument from 'pdfkit';
import { COMPANY } from '../company-info';
import { COLORS, FONT_SIZE, SPACING } from '../pdf-styles';

interface RequisitesOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
}

/**
 * Отрисовка блока с реквизитами
 */
export function drawRequisites({ doc, x, y, width }: RequisitesOptions): void {
  // Тонкая линия-разделитель сверху
  doc
    .strokeColor(COLORS.borderMedium)
    .lineWidth(0.75)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke();

  const contentY = y + SPACING.lg;

  // Левая колонка — название компании
  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.text)
    .text(COMPANY.fullName, x, contentY, {
      width: width / 2 - SPACING.sm,
      align: 'left',
      lineGap: 3,
    });

  // Правая колонка — ИНН/КПП и ОГРН
  const rightColumn = [
    `ИНН ${COMPANY.inn} / КПП ${COMPANY.kpp}`,
    `ОГРН ${COMPANY.ogrn}`,
  ].join('\n');

  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.textLight)
    .text(rightColumn, x + width / 2 + SPACING.sm, contentY, {
      width: width / 2 - SPACING.sm,
      align: 'right',
      lineGap: 3,
    });
}
