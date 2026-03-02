import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/test-env
 * Проверка загруженных переменных окружения
 */
export async function GET() {
  const envVars = {
    OPENROUTE_API_KEY: process.env.OPENROUTE_API_KEY ? '✅ задан' : '❌ не задан',
    YANDEX_API_KEY: process.env.YANDEX_API_KEY ? '✅ задан' : '❌ не задан',
    YANDEX_GEOCODER_KEY: process.env.YANDEX_GEOCODER_KEY ? '✅ задан' : '❌ не задан',
    DADATA_API_KEY: process.env.DADATA_API_KEY ? '✅ задан' : '❌ не задан',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✅ задан' : '❌ не задан',
  };

  logger.info('test-env: checking environment variables', envVars);

  return NextResponse.json({
    message: 'Environment variables status',
    variables: envVars,
  });
}
