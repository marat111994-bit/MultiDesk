/**
 * Стили и константы для PDF генератора
 */

/**
 * Цветовая палитра
 */
export const COLORS = {
  text: '#334155',         // Основной текст
  textLight: '#64748b',    // Светлый текст (лейблы)
  textMuted: '#94a3b8',    // Приглушённый текст (условия, футер)
  heading: '#1e293b',      // Заголовки
  accent: '#059669',       // Зелёный для итого
  border: '#e2e8f0',       // Границы
  borderMedium: '#cbd5e1', // Средние границы
  tableHeader: '#eef2f7',  // Фон заголовков таблицы (очень светлый серо-голубой)
  tableHeaderText: '#475569', // Текст заголовков таблицы (серо-синий)
  tableRow: '#ffffff',     // Фон строки данных
  tableTotalBg: '#f1f5f9', // Фон строки итого
  tableTotalText: '#1e293b', // Текст строки итого
  infoBg: '#f8fafc',       // Фон информационных блоков
  white: '#ffffff',
} as const;

/**
 * Размеры страницы A4 в points (1pt = 1/72 inch)
 */
export const PAGE = {
  width: 595.28,           // A4 width
  height: 841.89,          // A4 height
  margin: 36,              // ~12.7mm — компактные отступы
} as const;

/**
 * Ширина контента
 */
export const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

/**
 * Размеры шрифтов
 */
export const FONT_SIZE = {
  xs: 7,    // Условия, мелкий текст
  sm: 8,    // Лейблы, реквизиты
  base: 9,  // Основной текст
  lg: 11,   // Заголовки секций
  xl: 14,   // Главный заголовок
  logo: 18, // Логотип текстом
  qr: 20,   // QR placeholder
} as const;

/**
 * Отступы (в points)
 */
export const SPACING = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
} as const;

/**
 * Высоты секций (приблизительные)
 */
export const SECTION_HEIGHT = {
  header: 50,
  title: 35,
  infoCard: 140,
  table: 80,
  terms: 25,
  requisites: 50,
  signature: 60,
} as const;
