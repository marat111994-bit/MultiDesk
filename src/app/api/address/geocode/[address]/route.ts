import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/address/geocode/[address]
 * Геокодирование адреса через Яндекс.Карты API
 * Возвращает { lat, lon }
 * Использует YANDEX_API_KEY из process.env
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: 'Адрес обязателен' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YANDEX_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'YANDEX_API_KEY не настроен' },
        { status: 500 }
      );
    }

    // Яндекс.Геокодер API
    const url = new URL('https://geocode-maps.yandex.ru/1.x/');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('geocode', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('lang', 'ru_RU');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Yandex API error: ${response.status}`);
    }

    const data = await response.json();

    const featureMember = data.response?.GeoObjectCollection?.featureMember?.[0];

    if (!featureMember) {
      return NextResponse.json(
        { error: 'Адрес не найден' },
        { status: 404 }
      );
    }

    const geoObject = featureMember.GeoObject;
    const pos = geoObject?.Point?.pos;

    if (!pos) {
      return NextResponse.json(
        { error: 'Координаты не найдены' },
        { status: 404 }
      );
    }

    // pos формат: "lon lat"
    const [lon, lat] = pos.split(' ').map(Number);

    return NextResponse.json({ lat, lon });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return NextResponse.json(
      { error: 'Ошибка при геокодировании адреса' },
      { status: 500 }
    );
  }
}
