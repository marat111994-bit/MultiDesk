# DanMax Website

Сайт компании ДанМакс — утилизация и вывоз грунта, инертных материалов, снега.

## Getting Started

Запуск сервера разработки:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Модуль Калькулятор

### Описание функционала

Калькулятор грузоперевозок и утилизации отходов позволяет рассчитать стоимость:
- **Транспортных услуг** — вывоз грунта, снега, инертных материалов
- **Утилизации** — размещение отходов на полигонах Москвы и МО
- **Комплексных услуг** — транспорт + утилизация

**Основные возможности:**
- Расчёт расстояния между адресами через OpenRouteService API
- Геокодирование адресов через Яндекс.Карты API
- Выбор груза из номенклатуры (1000+ позиций)
- Автоматический выбор полигона (топ-5) или ручной выбор
- Генерация коммерческого предложения (PDF/HTML)
- Сохранение расчётов в базу данных

### Переменные окружения

Для работы калькулятора необходимы следующие переменные в `.env`:

```bash
# Калькулятор
OPENROUTE_API_KEY=your_key_here    # https://openrouteservice.org
DADATA_API_KEY=your_key_here       # https://dadata.ru
DADATA_SECRET=your_secret_here
YANDEX_GEOCODER_KEY=your_key_here  # https://developer.tech.yandex.ru

# Компания (для PDF)
COMPANY_NAME="ДанМакс"
COMPANY_PHONE="+7 (495) XXX-XX-XX"
COMPANY_EMAIL="info@danmax.ru"
COMPANY_INN="XXXXXXXXXX"
```

### Инструкция по импорту данных

Импорт данных калькулятора из CSV (полигоны, тарифы, номенклатура):

```bash
npm run import:calculator ./data
```

Где `./data` — директория с CSV файлами:
- `polygons.csv` — полигоны утилизации
- `utilization-tariffs.csv` — тарифы утилизации
- `cargo-categories.csv` — категории грузов
- `cargo-items.csv` — номенклатура грузов

### API Endpoints

**Публичные:**
| Endpoint | Описание |
|----------|----------|
| `POST /api/calculator/calculate-transport` | Расчёт стоимости перевозки |
| `POST /api/calculator/calculate-disposal` | Расчёт утилизации (автовыбор полигона) |
| `POST /api/calculator/calculate-disposal-single` | Расчёт утилизации (конкретный полигон) |
| `GET /api/calculator/cargo-categories` | Список категорий грузов |
| `GET /api/calculator/cargo-items/[categoryCode]` | Грузы категории |
| `GET /api/calculator/polygons?search=...` | Поиск полигонов |
| `GET /api/address/suggest/[text]` | Подсказки адресов |
| `GET /api/address/geocode/[address]` | Геокодирование адреса |
| `GET /api/calculator/pdf/[id]` | Генерация PDF КП |
| `GET /api/calculator/pdf/[id]/preview` | Превью КП (HTML) |
| `POST /api/calculator/applications` | Сохранение расчёта |
| `GET /api/calculator/applications/[id]` | Получение расчёта |

**Админ-панель:**
| Endpoint | Описание |
|----------|----------|
| `GET /api/admin/calculator/applications` | Список расчётов (фильтры, пагинация) |
| `GET /api/admin/calculator/applications/[id]` | Детали расчёта |
| `PATCH /api/admin/calculator/applications/[id]` | Обновление статуса |
| `GET/POST /api/admin/calculator/applications/[id]/comments` | Комментарии к расчёту |
| `GET /api/admin/calculator/polygons` | Список полигонов |
| `GET/PUT /api/admin/calculator/polygons/[polygonId]` | Управление полигоном |
| `GET/POST /api/admin/calculator/polygons/[polygonId]/tariffs` | Тарифы полигона |
| `GET /api/admin/calculator/transport-tariffs` | Транспортные тарифы |
| `GET/PUT /api/admin/calculator/transport-tariffs/config` | Конфигурация тарифов |
| `POST /api/admin/calculator/transport-tariffs/generate` | Генерация линейных тарифов |
| `POST /api/admin/calculator/transport-tariffs/hyperbolic` | Генерация гиперболических тарифов |

## Deploy

### Railway

Проект развёртывается на [Railway](https://railway.app/).

**Требования:**
- Chromium для генерации PDF (установлен через nixpacks)
- PostgreSQL база данных (add PostgreSQL в Railway проекте)

**Переменные окружения в Railway:**
```bash
DATABASE_URL=postgresql://...
OPENROUTE_API_KEY=...
YANDEX_API_KEY=...
DADATA_API_KEY=...
COMPANY_NAME="ДанМакс"
COMPANY_PHONE="+7 (495) XXX-XX-XX"
COMPANY_EMAIL="info@danmax.ru"
COMPANY_INN="XXXXXXXXXX"
```

**Миграции:**
```bash
npx prisma generate
npx prisma migrate deploy
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Railway Documentation](https://docs.railway.app/)
