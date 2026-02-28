// Утилиты для калькулятора

/**
 * Форматирует число в русский формат с пробелами и знаком рубля
 * Пример: 76200 -> "76 200 ₽"
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

/**
 * Форматирует телефонную маску
 * Пример: "+79991234567" -> "+7 (999) 123-45-67"
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (!digits) return '';
  if (digits[0] === '7' || digits[0] === '8') {
    return formatPhoneFromDigits(digits.slice(1));
  }
  return formatPhoneFromDigits(digits);
}

function formatPhoneFromDigits(digits: string): string {
  const limited = digits.slice(0, 10);
  let result = '+7';

  if (limited.length > 0) {
    result += ' (' + limited.slice(0, 3);
  }
  if (limited.length >= 3) {
    result += ') ' + limited.slice(3, 6);
  }
  if (limited.length >= 6) {
    result += '-' + limited.slice(6, 8);
  }
  if (limited.length >= 8) {
    result += '-' + limited.slice(8, 10);
  }

  return result;
}

/**
 * Извлекает только цифры из телефона для API
 */
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Создаёт debounce функцию
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const later = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  }) as T;
}

/**
 * Валидация ИНН (российский формат)
 */
export function validateInn(inn: string): boolean {
  const cleanInn = inn.replace(/\D/g, '');
  if (cleanInn.length !== 10 && cleanInn.length !== 12) {
    return false;
  }
  return true;
}

/**
 * Валидация email
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Генерация ID заявки в формате CD-ДДММГГ-NNN
 */
export function generateApplicationId(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const random = Math.floor(Math.random() * 900) + 100;

  return `CD-${day}${month}${year}-${random}`;
}

/**
 * Парсинг координат из строки "lat,lng"
 */
export function parseCoords(coords: string): { lat: number; lng: number } | null {
  try {
    const [lat, lng] = coords.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

/**
 * Вычисление расстояния между двумя точками (формула гаверсинуса)
 * Возвращает расстояние в км
 */
export function calculateDistance(
  coords1: string,
  coords2: string
): number | null {
  const point1 = parseCoords(coords1);
  const point2 = parseCoords(coords2);

  if (!point1 || !point2) return null;

  const R = 6371; // Радиус Земли в км
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Режим работы в человекочитаемый формат
 */
export function formatMode(mode: 'day' | 'night' | '24'): string {
  switch (mode) {
    case 'day':
      return 'День (08:00-20:00)';
    case 'night':
      return 'Ночь (20:00-08:00)';
    case '24':
      return '24/7';
  }
}
