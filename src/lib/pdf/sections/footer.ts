/**
 * Секция 7: ФУТЕР
 * Одна строка с контактами внизу страницы
 */
import PDFDocument from 'pdfkit';
import { COMPANY } from '../company-info';
import { COLORS } from '../pdf-styles';

interface FooterOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
}

/**
 * Отрисовка футера
 */
export function drawFooter({ doc, x, y, width }: FooterOptions): void {
  const footerText = `${COMPANY.fullName} • ИНН ${COMPANY.inn} • ${COMPANY.website} • ${COMPANY.email}`;

  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.textMuted)
    .text(footerText, x, y, {
      width,
      align: 'center',
    });
}
