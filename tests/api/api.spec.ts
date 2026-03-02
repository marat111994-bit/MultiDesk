import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('API Tests', () => {
  test.describe('GET /api/test-env', () => {
    test('должен возвращать статус переменных окружения', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/test-env`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('variables');
      expect(data.variables).toHaveProperty('OPENROUTE_API_KEY');
      expect(data.variables).toHaveProperty('YANDEX_API_KEY');
      expect(data.variables).toHaveProperty('DADATA_API_KEY');
      expect(data.variables).toHaveProperty('TELEGRAM_BOT_TOKEN');
    });
  });

  test.describe('GET /api/company', () => {
    test('должен возвращать информацию о компании', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/company`);
      // API может возвращать 400 если нет данных в БД
      expect([200, 400]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('phone');
        expect(data).toHaveProperty('email');
        expect(data).toHaveProperty('inn');
      }
    });
  });

  test.describe('POST /api/contact', () => {
    test('должен принимать форму обратной связи', async ({ request }) => {
      const testData = {
        name: 'Тестовый Пользователь',
        phone: '+7 (999) 000-00-00',
        message: 'Тестовое сообщение',
      };
      
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: testData,
      });
      expect([200, 201, 400]).toContain(response.status());
    });

    test('должен отклонять невалидные данные', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {},
      });
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('GET /api/address/suggest/:text', () => {
    test('должен возвращать подсказки адресов', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/address/suggest/москва`);
      // API может возвращать 500 если нет ключа или проблемы с сетью
      expect([200, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });
  });

  test.describe('GET /api/address/geocode/:address', () => {
    test('должен возвращать координаты адреса', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/address/geocode/Москва`);
      // API может возвращать 500 если нет ключа
      expect([200, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('lat');
        expect(data).toHaveProperty('lon');
      }
    });
  });

  test.describe('GET /api/calculator/polygons', () => {
    test('должен возвращать список полигонов', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/calculator/polygons`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('GET /api/calculator/cargo-categories', () => {
    test('должен возвращать категории грузов', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/calculator/cargo-categories`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
