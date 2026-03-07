/**
 * Секция 5: УСЛОВИЯ
 * Список с маркерами-кружочками
 */
import PDFDocument from 'pdfkit';
import { COLORS } from '../pdf-styles';

interface TermsOptions {
  doc: InstanceType<typeof PDFDocument>;
  x: number;
  y: number;
  width: number;
}

/**
 * Отрисовка блока с условиями
 */
export function drawTerms({ doc, x, y, width }: TermsOptions): void {
  const termsItems = [
    'Цены указаны с НДС 22%',
    'Предложение действительно 5 рабочих дней с момента отправки',
    'Окончательная стоимость уточняется по результатам согласования объёмов и маршрута',
    'Оплата по договору',
    'Не является публичной офертой (ст. 437 ГК РФ)',
  ];

  const fontSize = 7.5;
  const lineHeight = 12;
  const bulletRadius = 2;
  const bulletX = x + bulletRadius + 1;

  let currentY = y;

  termsItems.forEach((item) => {
    // Рисуем кружок-маркер
    doc
      .fillColor(COLORS.text)
      .circle(bulletX, currentY + fontSize / 2 + 1, bulletRadius)
      .fill();

    // Рисуем текст
    doc
      .font('Regular')
      .fontSize(fontSize)
      .fillColor(COLORS.text) // Более выразительный цвет (не textMuted)
      .text(item, x + 8, currentY, {
        width: width - 10,
        align: 'left',
        lineGap: 2,
      });

    currentY += lineHeight;
  });
}
