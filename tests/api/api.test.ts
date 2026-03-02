import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  startDevServer,
  stopDevServer,
  waitForServer,
  apiGet,
  apiPost,
} from '../utils/api-test-client';

const TEST_PORT = 3001;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await startDevServer();
    const isReady = await waitForServer();
    if (!isReady) {
      throw new Error('Server did not become ready in time');
    }
  }, 60000);

  afterAll(async () => {
    await stopDevServer();
  });

  describe('GET /api/test-env', () => {
    it('должен возвращать статус переменных окружения', async () => {
      const response = await apiGet('/api/test-env');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('variables');
      expect(data.variables).toHaveProperty('OPENROUTE_API_KEY');
      expect(data.variables).toHaveProperty('YANDEX_API_KEY');
      expect(data.variables).toHaveProperty('DADATA_API_KEY');
      expect(data.variables).toHaveProperty('TELEGRAM_BOT_TOKEN');
    });
  });

  describe('GET /api/company', () => {
    it('должен возвращать информацию о компании', async () => {
      const response = await apiGet('/api/company');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('phone');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('inn');
    });
  });

  describe('POST /api/contact', () => {
    it('должен принимать форму обратной связи', async () => {
      const testData = {
        name: 'Тестовый Пользователь',
        phone: '+7 (999) 000-00-00',
        message: 'Тестовое сообщение',
      };
      
      const response = await apiPost('/api/contact', testData);
      expect([200, 201]).toContain(response.status);
    });

    it('должен отклонять невалидные данные', async () => {
      const response = await apiPost('/api/contact', {});
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/address/suggest/:text', () => {
    it('должен возвращать подсказки адресов', async () => {
      const response = await apiGet('/api/address/suggest/москва');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/address/geocode/:address', () => {
    it('должен возвращать координаты адреса', async () => {
      const response = await apiGet('/api/address/geocode/Москва');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('lat');
      expect(data).toHaveProperty('lon');
    });
  });

  describe('GET /api/calculator/polygons', () => {
    it('должен возвращать список полигонов', async () => {
      const response = await apiGet('/api/calculator/polygons');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/calculator/cargo-categories', () => {
    it('должен возвращать категории грузов', async () => {
      const response = await apiGet('/api/calculator/cargo-categories');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
