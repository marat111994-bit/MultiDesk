import { test, expect } from '@playwright/test';

test.describe('Environment Variables', () => {
  test('should have DATABASE_URL', async () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).toContain('postgresql://');
  });

  test('should have TELEGRAM_BOT_TOKEN configured', async () => {
    // Проверяем, что переменная определена (значение может быть placeholder)
    expect(process.env.TELEGRAM_BOT_TOKEN).toBeDefined();
  });

  test('should have DADATA_API_KEY configured', async () => {
    expect(process.env.DADATA_API_KEY).toBeDefined();
  });

  test('should have YANDEX_API_KEY configured', async () => {
    expect(process.env.YANDEX_API_KEY).toBeDefined();
  });

  test('should have COMPANY_INN', async () => {
    expect(process.env.COMPANY_INN).toBeDefined();
    expect(process.env.COMPANY_INN?.length).toBeGreaterThanOrEqual(10);
  });

  test('should have NEXTAUTH_SECRET', async () => {
    expect(process.env.NEXTAUTH_SECRET).toBeDefined();
    expect(process.env.NEXTAUTH_SECRET?.length).toBeGreaterThanOrEqual(30);
  });
});
