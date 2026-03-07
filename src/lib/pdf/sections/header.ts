/**
 * Секция 1: ШАПКА документа
 * Компактная шапка: название + контакты + ИНН/КПП/ОГРН
 * Без ОКВЭД, ЭДО, юр.адреса, директора, банковских реквизитов
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
  const contactWidth = width / 2;
  let currentY = y;

  // === ЛЕВАЯ ЧАСТЬ — Название компании + реквизиты ===
  
  // Название компании — 24pt Bold (увеличено в 2 раза)
  doc
    .font('Bold')
    .fontSize(24)
    .fillColor(COLORS.heading)
    .text(COMPANY.fullName, x, currentY, {
      width: contactWidth,
      align: 'left',
    });
  
  currentY += 28; // отступ после названия

  // Под названием — tagline
  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.textMuted)
    .text(
      COMPANY.tagline,
      x,
      currentY,
      { width: contactWidth, align: 'left' }
    );
  
  currentY += 12; // отступ после tagline

  // ИНН/КПП
  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.textLight)
    .text(
      `ИНН ${COMPANY.inn} / КПП ${COMPANY.kpp}`,
      x,
      currentY,
      { width: contactWidth, align: 'left' }
    );
  
  currentY += 11; // отступ после ИНН/КПП

  // ОГРН
  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.textLight)
    .text(
      `ОГРН ${COMPANY.ogrn}`,
      x,
      currentY,
      { width: contactWidth, align: 'left' }
    );

  // === ПРАВАЯ ЧАСТЬ — Контакты (по правому краю) ===
  const contactX = x + contactWidth;
  const contactY = y;

  // Телефон — 8pt
  doc
    .font('Regular')
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(COMPANY.phone, contactX, contactY, {
      width: contactWidth,
      align: 'right',
    });

  // Email — 8pt
  doc
    .font('Regular')
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(COMPANY.email, contactX, contactY + 12, {
      width: contactWidth,
      align: 'right',
    });

  // Сайт — 7pt
  doc
    .font('Regular')
    .fontSize(7)
    .fillColor(COLORS.textMuted)
    .text(COMPANY.website, contactX, contactY + 24, {
      width: contactWidth,
      align: 'right',
    });

  // === Горизонтальная линия под шапкой ===
  const lineY = y + 55;
  doc
    .strokeColor(COLORS.borderMedium)
    .lineWidth(0.75)
    .moveTo(x, lineY)
    .lineTo(x + width, lineY)
    .stroke();
}
