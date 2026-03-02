// Глобальные моки для тестов
import { vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем .env из корня проекта
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Mock next/auth
vi.mock('next/auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve(null)),
  auth: vi.fn(() => Promise.resolve(null)),
}));
