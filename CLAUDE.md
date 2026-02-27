# Проект DanMax — B2B сайт

## О проекте
Многостраничный сайт компании DanMax — вывоз и утилизация строительных отходов в Москве и МО.
Домен: danmax.moscow

## Стек
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Framer Motion (анимации)
- React Hook Form + Zod (формы)
- MDX (блог)
- next-sitemap (SEO)

## Архитектура
- Компоненты в src/components/ (layout, sections, ui, blog, seo)
- Данные в src/data/ (services.ts, pricing.ts, faq.ts и др.)
- Контент блога в src/content/blog/ (MDX)
- Страницы в src/app/ (файловая маршрутизация)

## Принципы
- Данные отделены от компонентов (все тексты в /data/)
- Один компонент = один файл
- TypeScript strict, no any
- Tailwind CSS only (без CSS-модулей)
- Семантический HTML (nav, main, section, article, footer)
- Все изображения через next/image
- Все тексты на русском (включая aria-label, alt, placeholder)
- Мобильная адаптивность (mobile-first)

## Структура страниц
- 6 основных услуг с подкатегориями (всего ~21 коммерческая страница)
- Калькулятор (CargoDesk)
- Блог (5 статей/мес)
- Служебные (о компании, контакты, политика)

## 12 блоков лендинга
1. TopBar — телефон, мессенджеры, режим работы
2. Header — лого, навигация, CTA
3. HeroSection — H1, подзаголовок, изображение, 3 CTA
4. TrustNumbers — 4 цифры/факта
5. WhyUs — преимущества с изображением
6. HowWeWork — 5 шагов (timeline)
7. PricingTable — таблица цен с кнопками
8. CalculatorEmbed — iframe CargoDesk
9. CasesSection — кейсы + логотипы клиентов
10. FaqSection — аккордеон FAQ
11. ContactForm — форма заявки
12. Footer — навигация, контакты, юр. данные

## Контакты (для компонентов)
- Телефон: +7 (985) 718-48-10 (ЗАМЕНИТЬ)
- Telegram: https://t.me/danmax_logistic (ЗАМЕНИТЬ)
- WhatsApp: https://wa.me/79857184810 (ЗАМЕНИТЬ)
- Email: info@danmax.moscow (ЗАМЕНИТЬ)
- Адрес: Москва, пр-кт. Кутузовский, 10. (ЗАМЕНИТЬ)
- Режим работы: Пн–Сб 8:00–20:00
