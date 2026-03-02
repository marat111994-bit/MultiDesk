import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/geocode/reverse?lat=55.7558&lon=37.6173
 * Обратное геокодирование координат через Яндекс.Карты API
 * Возвращает { address: string }
 * Использует YANDEX_GEOCODER_KEY из process.env
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Координаты обязательны (lat, lon)' },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return NextResponse.json(
        { error: 'Неверный формат координат' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YANDEX_GEOCODER_KEY || process.env.YANDEX_API_KEY;

    if (!apiKey) {
      logger.error('reverse-geocode: API key missing');
      return NextResponse.json(
        { error: 'YANDEX_GEOCODER_KEY или YANDEX_API_KEY не настроен' },
        { status: 500 }
      );
    }

    // Яндекс.Геокодер API для обратного геокодирования
    const url = new URL('https://geocode-maps.yandex.ru/1.x/');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('geocode', `${lon},${lat}`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('lang', 'ru_RU');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('reverse-geocode: Yandex API error', { status: response.status, error: errorText.slice(0, 200) });
      throw new Error(`Yandex API error: ${response.status}`);
    }

    const data = await response.json();

    const featureMember = data.response?.GeoObjectCollection?.featureMember?.[0];

    if (!featureMember) {
      return NextResponse.json(
        { error: 'Адрес по координатам не найден' },
        { status: 404 }
      );
    }

    const geoObject = featureMember.GeoObject;
    const address = geoObject?.name || geoObject?.description || '';

    if (!address) {
      return NextResponse.json(
        { error: 'Адрес не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ address });
  } catch (error) {
    logger.error('reverse-geocode: error', { message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Ошибка при обратном геокодировании' },
      { status: 500 }
    );
  }
}
