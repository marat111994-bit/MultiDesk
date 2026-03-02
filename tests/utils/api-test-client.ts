import { spawn, ChildProcess } from 'child_process';
import { setTimeout } from 'timers/promises';

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let devServer: ChildProcess | null = null;

/**
 * Запускает Next.js dev сервер для тестов
 */
export async function startDevServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    devServer = spawn('npm', ['run', 'dev', '--', '-p', TEST_PORT.toString()], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' },
    });

    devServer.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[DevServer] ${output}`);
      
      if (output.includes('ready') || output.includes('Local:')) {
        resolve();
      }
    });

    devServer.stderr?.on('data', (data) => {
      const output = data.toString();
      console.error(`[DevServer Error] ${output}`);
    });

    devServer.on('error', (err) => {
      reject(err);
    });

    // Таймаут на запуск сервера
    setTimeout(30000).then(() => {
      reject(new Error('Dev server did not start in 30 seconds'));
    });
  });
}

/**
 * Останавливает dev сервер
 */
export async function stopDevServer(): Promise<void> {
  if (devServer) {
    devServer.kill();
    devServer = null;
    await setTimeout(1000);
  }
}

/**
 * Выполняет HTTP запрос к API
 */
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error}`);
  }
}

/**
 * GET запрос к API
 */
export async function apiGet(endpoint: string): Promise<Response> {
  return fetchAPI(endpoint, { method: 'GET' });
}

/**
 * POST запрос к API
 */
export async function apiPost(
  endpoint: string,
  data?: Record<string, unknown>
): Promise<Response> {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT запрос к API
 */
export async function apiPut(
  endpoint: string,
  data?: Record<string, unknown>
): Promise<Response> {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE запрос к API
 */
export async function apiDelete(endpoint: string): Promise<Response> {
  return fetchAPI(endpoint, { method: 'DELETE' });
}

/**
 * Проверяет доступность сервера
 */
export async function waitForServer(
  maxAttempts = 30,
  delayMs = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${TEST_PORT}/api/test-env`);
      if (response.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await setTimeout(delayMs);
  }
  return false;
}
