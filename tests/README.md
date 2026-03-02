# Тесты для Danmax Website

## Запуск тестов

### Все тесты
```bash
npm run test:e2e
```

### Тесты переменных окружения
```bash
npm run test:e2e -- tests/env/env.spec.ts
```

### API тесты
```bash
npm run test:e2e -- tests/api/api.spec.ts
```

### Тесты с UI
```bash
npm run test:e2e:ui
```

## Структура тестов

### `tests/env/env.spec.ts`
Проверяет наличие и корректность переменных окружения из `.env`:
- `DATABASE_URL` - подключение к PostgreSQL
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `DADATA_API_KEY` - API ключ DaData
- `YANDEX_API_KEY` - API ключ Яндекс
- `COMPANY_INN` - ИНН компании
- `NEXTAUTH_SECRET` - секрет NextAuth

### `tests/api/api.spec.ts`
Интеграционные тесты API эндпоинтов:
- `GET /api/test-env` - проверка переменных окружения
- `GET /api/company` - информация о компании
- `POST /api/contact` - форма обратной связи
- `GET /api/address/suggest/:text` - подсказки адресов
- `GET /api/address/geocode/:address` - геокодирование
- `GET /api/calculator/polygons` - полигоны калькулятора
- `GET /api/calculator/cargo-categories` - категории грузов

## Требования

1. Установите зависимости:
```bash
npm install
```

2. Для API тестов запустите dev сервер:
```bash
npm run dev
```

3. Заполните `.env` файл необходимыми переменными

## Отчёт о тестах

После запуска тестов HTML отчёт будет доступен в папке `playwright-report/`:
```bash
npx playwright show-report
```
