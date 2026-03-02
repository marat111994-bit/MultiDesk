import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/address/suggest/[text]
 * Прокси к Яндекс.Картам API для подсказок адресов
 * Использует YANDEX_API_KEY из process.env
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ text: string }> }
) {
  try {
    const { text } = await params;
    const searchParams = request.nextUrl.searchParams;
    const results = searchParams.get('results') || '10';

    logger.info('address-suggest: request', { text, results })

    if (!text || text.length < 2) {
      return NextResponse.json(
        { error: 'Введите минимум 2 символа для поиска' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YANDEX_SUGGEST_KEY || process.env.YANDEX_API_KEY;

    if (!apiKey) {
      logger.error('address-suggest: API key missing')
      return NextResponse.json(
        { error: 'YANDEX_SUGGEST_KEY или YANDEX_API_KEY не настроен' },
        { status: 500 }
      );
    }

    // Яндекс.Суггест API
    const url = new URL('https://suggest-maps.yandex.ru/v1/suggest');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('text', text);
    url.searchParams.set('lang', 'ru_RU');
    url.searchParams.set('results', results);
    url.searchParams.set('bbox', '37.0,55.0,38.0,56.0'); // Москва и область

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('address-suggest: Yandex API error', { status: response.status, error: errorText.slice(0, 200) })
      throw new Error(`Yandex API error: ${response.status}`);
    }

    const data = await response.json();

    logger.info('address-suggest: received', { count: data.results?.length || 0 })

    // Преобразуем в формат AddressSuggestion[]
    const suggestions = data.results?.map((item: { 
      title: { text: string }; 
      subtitle?: { text: string };
      point?: { lon: string; lat: string };
    }) => {
      const title = item.title?.text || '';
      const subtitle = item.subtitle?.text || '';
      // Яндекс.Суггест может возвращать координаты в point
      let coords = '';
      if (item.point && item.point.lon && item.point.lat) {
        coords = `${item.point.lat},${item.point.lon}`;
      }
      return {
        value: subtitle ? `${title}, ${subtitle}` : title,
        coords
      };
    }) || [];

    logger.info('address-suggest: response', { suggestionsCount: suggestions.length })

    return NextResponse.json(suggestions);
  } catch (error) {
    logger.error('address-suggest: error', { message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Ошибка при получении подсказок адресов' },
      { status: 500 }
    );
  }
}
