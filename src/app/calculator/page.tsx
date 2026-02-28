'use client';

import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/container';

export default function CalculatorPage() {
  const router = useRouter();

  const services = [
    {
      icon: '🚛',
      title: 'Перевозка',
      description: 'Везём груз из точки А в Б',
      details: 'Цена зависит от расстояния',
      href: '/calculator/transport',
      color: 'blue',
    },
    {
      icon: '♻️',
      title: 'Перевозка + утилизация',
      description: 'Находим лучший полигон по цене',
      details: 'Показываем топ-5 вариантов',
      href: '/calculator/disposal-auto',
      color: 'green',
    },
    {
      icon: '📍',
      title: 'Перевозка + утилизация',
      description: '(выбор полигона)',
      details: 'Вы уже знаете куда везти',
      href: '/calculator/disposal-manual',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          hover: 'hover:border-blue-400 hover:shadow-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          hover: 'hover:border-green-400 hover:shadow-green-100',
          button: 'bg-green-600 hover:bg-green-700',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          hover: 'hover:border-purple-400 hover:shadow-purple-100',
          button: 'bg-purple-600 hover:bg-purple-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          hover: 'hover:border-gray-400 hover:shadow-gray-100',
          button: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Калькулятор' },
          ]}
        />
      </Container>

      <div className="py-12">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Калькулятор стоимости
            </h1>
            <p className="text-xl text-gray-600">
              Выберите услугу и рассчитайте стоимость за 2 минуты
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service) => {
              const colors = getColorClasses(service.color);

              return (
                <div
                  key={service.href}
                  onClick={() => router.push(service.href)}
                  className={`cursor-pointer rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-all duration-300 ${colors.hover} hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="text-5xl mb-4">{service.icon}</div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-1">{service.description}</p>
                  <p className="text-sm text-gray-500 mb-6">{service.details}</p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        service.color === 'blue'
                          ? 'text-blue-700'
                          : service.color === 'green'
                            ? 'text-green-700'
                            : 'text-purple-700'
                      }`}
                    >
                      Расчёт займёт 2 минуты
                    </span>

                    <button
                      className={`px-4 py-2 ${colors.button} text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
                    >
                      Рассчитать
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Почему выбирают нас
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Быстрый расчёт
                  </h3>
                  <p className="text-sm text-gray-600">
                    Получите точную стоимость за 2 минуты онлайн
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Лицензированные полигоны
                  </h3>
                  <p className="text-sm text-gray-600">
                    Все полигоны имеют лицензии на утилизацию отходов
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Прозрачные цены
                  </h3>
                  <p className="text-sm text-gray-600">
                    Никаких скрытых платежей — всё честно и открыто
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
