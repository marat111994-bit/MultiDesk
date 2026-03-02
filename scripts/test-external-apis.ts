/**
 * Скрипт для проверки работы всех внешних API
 * Запуск: npx tsx scripts/test-external-apis.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEYS = {
  OPENROUTE_API_KEY: process.env.OPENROUTE_API_KEY,
  YANDEX_API_KEY: process.env.YANDEX_API_KEY,
  YANDEX_GEOCODER_KEY: process.env.YANDEX_GEOCODER_KEY,
  YANDEX_SUGGEST_KEY: process.env.YANDEX_SUGGEST_KEY,
  DADATA_API_KEY: process.env.DADATA_API_KEY,
  DADATA_TOKEN: process.env.DADATA_TOKEN,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
};

console.log('=== ПРОВЕРКА КЛЮЧЕЙ API ===\n');

// Проверка наличия ключей
const requiredKeys = {
  'OpenRouteService (расчёт расстояний)': 'OPENROUTE_API_KEY',
  'Yandex API (геокодер/адреса)': 'YANDEX_API_KEY',
  'Yandex Geocoder (геокодирование)': 'YANDEX_GEOCODER_KEY',
  'DaData API (проверка компаний)': 'DADATA_API_KEY',
  'Telegram Bot (уведомления)': 'TELEGRAM_BOT_TOKEN',
  'Telegram Chat ID': 'TELEGRAM_CHAT_ID',
};

let allKeysPresent = true;
for (const [name, key] of Object.entries(requiredKeys)) {
  const value = API_KEYS[key as keyof typeof API_KEYS];
  const status = value && value !== 'your_bot_token_here' && value !== 'your_chat_id_here' && value !== 'your_secret_key_here' ? '✅' : '❌';
  if (!value || value.startsWith('your_')) allKeysPresent = false;
  console.log(`${status} ${name}: ${key} = ${value ? value.substring(0, 20) + '...' : 'НЕ ЗАДАН'}`);
}

console.log('\n=== ТЕСТИРОВАНИЕ API ===\n');

async function testOpenRouteService() {
  const apiKey = API_KEYS.OPENROUTE_API_KEY;
  if (!apiKey) {
    console.log('❌ OpenRouteService: API ключ не настроен\n');
    return false;
  }
  
  try {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + apiKey + '&start=37.6176,55.7558&end=37.6415,55.7344';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const distance = data.features?.[0]?.properties?.segments?.[0]?.distance;
      console.log(`✅ OpenRouteService: расстояние = ${(distance / 1000).toFixed(2)} км\n`);
      return true;
    } else {
      console.log(`❌ OpenRouteService: ошибка ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenRouteService: ${error instanceof Error ? error.message : 'ошибка'}\n`);
    return false;
  }
}

async function testYandexGeocoder() {
  const apiKey = API_KEYS.YANDEX_GEOCODER_KEY || API_KEYS.YANDEX_API_KEY;
  if (!apiKey) {
    console.log('❌ Yandex Geocoder: API ключ не настроен\n');
    return false;
  }
  
  try {
    const url = new URL('https://geocode-maps.yandex.ru/1.x/');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('geocode', 'Москва, Красная площадь, 1');
    url.searchParams.set('format', 'json');
    
    const response = await fetch(url.toString(), { method: 'GET' });
    
    if (response.ok) {
      const data = await response.json();
      const found = data.response?.GeoObjectCollection?.featureMember?.length > 0;
      console.log(`✅ Yandex Geocoder: найдено объектов = ${found ? 'да' : 'нет'}\n`);
      return found;
    } else {
      console.log(`❌ Yandex Geocoder: ошибка ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Yandex Geocoder: ${error instanceof Error ? error.message : 'ошибка'}\n`);
    return false;
  }
}

async function testYandexSuggest() {
  const apiKey = API_KEYS.YANDEX_SUGGEST_KEY || API_KEYS.YANDEX_API_KEY;
  if (!apiKey) {
    console.log('❌ Yandex Suggest: API ключ не настроен\n');
    return false;
  }
  
  try {
    const url = new URL('https://suggest-maps.yandex.ru/v1/suggest');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('text', 'Москва, Твер');
    url.searchParams.set('lang', 'ru_RU');
    
    const response = await fetch(url.toString(), { method: 'GET' });
    
    if (response.ok) {
      const data = await response.json();
      const count = data.results?.length || 0;
      console.log(`✅ Yandex Suggest: найдено подсказок = ${count}\n`);
      return count > 0;
    } else {
      console.log(`❌ Yandex Suggest: ошибка ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Yandex Suggest: ${error instanceof Error ? error.message : 'ошибка'}\n`);
    return false;
  }
}

async function testDaData() {
  const token = API_KEYS.DADATA_TOKEN || API_KEYS.DADATA_API_KEY;
  if (!token) {
    console.log('❌ DaData: API ключ не настроен\n');
    return false;
  }
  
  try {
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ query: '7707083893' }), // ИНН Сбербанка для теста
    });
    
    if (response.ok) {
      const data = await response.json();
      const found = data.suggestions?.length > 0;
      console.log(`✅ DaData: компания найдена = ${found ? 'да' : 'нет'}\n`);
      return true;
    } else {
      console.log(`❌ DaData: ошибка ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ DaData: ${error instanceof Error ? error.message : 'ошибка'}\n`);
    return false;
  }
}

async function testTelegram() {
  const token = API_KEYS.TELEGRAM_BOT_TOKEN;
  const chatId = API_KEYS.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId || token.startsWith('your_') || chatId.startsWith('your_')) {
    console.log('❌ Telegram: не настроен (нужен токен бота и chat_id)\n');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      const botName = data.result?.username || 'бот';
      console.log(`✅ Telegram Bot: @${botName} доступен\n`);
      return true;
    } else {
      console.log(`❌ Telegram: ошибка ${response.status} (неверный токен?)\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Telegram: ${error instanceof Error ? error.message : 'ошибка'}\n`);
    return false;
  }
}

// Запуск тестов
(async () => {
  console.log('Запуск тестирования...\n');
  
  const results = {
    'OpenRouteService': await testOpenRouteService(),
    'Yandex Geocoder': await testYandexGeocoder(),
    'Yandex Suggest': await testYandexSuggest(),
    'DaData': await testDaData(),
    'Telegram': await testTelegram(),
  };
  
  console.log('=== ИТОГИ ===\n');
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  console.log(`Пройдено тестов: ${passed}/${total}`);
  
  for (const [name, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  }
  
  if (!allKeysPresent) {
    console.log('\n⚠️  Внимание: не все API ключи настроены в .env.local');
  }
  
  process.exit(passed === total ? 0 : 1);
})();
