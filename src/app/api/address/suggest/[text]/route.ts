import { NextRequest, NextResponse } from 'next/server';

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

    if (!text || text.length < 2) {
      return NextResponse.json(
        { error: 'Введите минимум 2 символа для поиска' },
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
      throw new Error(`Yandex API error: ${response.status}`);
    }

    const data = await response.json();

    // Преобразуем в массив строк с адресами
    const suggestions = data.results?.map((item: { title: { text: string }; subtitle?: { text: string } }) => {
      const title = item.title?.text || '';
      const subtitle = item.subtitle?.text || '';
      return subtitle ? `${title}, ${subtitle}` : title;
    }) || [];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении подсказок адресов' },
      { status: 500 }
    );
  }
}
