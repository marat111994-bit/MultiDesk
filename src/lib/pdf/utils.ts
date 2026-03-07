/**
 * Утилиты для PDF генератора
 */

/**
 * Нормализация единицы измерения в кириллицу
 */
export function normalizeUnit(unit: string): string {
  const map: Record<string, string> = {
    't': 'т',
    'ton': 'т',
    'tons': 'т',
    'm3': 'м³',
    'm³': 'м³',
    'm2': 'м²',
    'm²': 'м²',
    'kg': 'кг',
    'centner': 'ц',
  };
  return map[unit.toLowerCase()] || unit;
}
