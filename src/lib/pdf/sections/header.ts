/**
 * Секция 1: ШАПКА документа
 * Трёхуровневая шапка:
 * 1. ООО «ДАН-МАКС» (по центру, 23pt Bold)
 * 2. Tagline (по центру, подобран шрифт)
 * 3. ИНН/ОГРН (слева) + Контакты (справа)
 */
import PDFDocument from 'pdfkit';
import { COMPANY } from '../company-info';
import { COLORS } from '../pdf-styles';

interface HeaderOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
}

/**
 * Отрисовка шапки документа
 */
export function drawHeader({ doc, x, y, width }: HeaderOptions): void {
  const centerX = x + width / 2;
  let currentY = y;

  // === СТРОКА 1: ООО «ДАН-МАКС» (по центру, 23pt Bold) ===
  doc
    .font('Bold')
    .fontSize(23)
    .fillColor(COLORS.heading)
    .text(COMPANY.fullName, x, currentY, {
      width,
      align: 'center',
    });

  // === ЛИНИЯ 1 ===
  const line1Y = currentY + 28;
  doc
    .strokeColor(COLORS.borderMedium)
    .lineWidth(0.75)
    .moveTo(x, line1Y)
    .lineTo(x + width, line1Y)
    .stroke();

  currentY = line1Y + 10;

  // === СТРОКА 2: Tagline (по центру, 11pt чтобы совпадало по ширине) ===
  // Подбираем размер шрифта так, чтобы ширина строки ≈ ширине названия
  const taglineFontSize = 11;
  
  doc
    .font('Regular')
    .fontSize(taglineFontSize)
    .fillColor(COLORS.text)
    .text(
      COMPANY.tagline,
      x,
      currentY,
      {
        width,
        align: 'center',
      }
    );

  // === ЛИНИЯ 2 ===
  const line2Y = currentY + 18;
  doc
    .strokeColor(COLORS.borderMedium)
    .lineWidth(0.75)
    .moveTo(x, line2Y)
    .lineTo(x + width, line2Y)
    .stroke();

  currentY = line2Y + 12;

  // === СТРОКА 3: ИНН/ОГРН (слева) + Контакты (справа) ===
  const leftColumnWidth = width / 2 - 10;
  const rightColumnWidth = width / 2 - 10;
  const leftX = x + 5;
  const rightX = x + width / 2 + 5;

  // Левая колонка: ИНН/КПП и ОГРН
  const leftText = `ИНН ${COMPANY.inn} / КПП ${COMPANY.kpp}\nОГРН ${COMPANY.ogrn}`;
  
  doc
    .font('Regular')
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(leftText, leftX, currentY, {
      width: leftColumnWidth,
      align: 'left',
      lineGap: 3,
    });

  // Правая колонка: Контакты (3 строки)
  const rightText = `${COMPANY.phone}\n${COMPANY.email}\n${COMPANY.website}`;
  
  doc
    .font('Regular')
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(rightText, rightX, currentY, {
      width: rightColumnWidth,
      align: 'right',
      lineGap: 3,
    });

  // === ЛИНИЯ 3 (перед заголовком) ===
  const line3Y = currentY + 35;
  doc
    .strokeColor(COLORS.borderMedium)
    .lineWidth(0.75)
    .moveTo(x, line3Y)
    .lineTo(x + width, line3Y)
    .stroke();
}
