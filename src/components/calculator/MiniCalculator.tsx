'use client';

import { useRouter } from 'next/navigation';

export function MiniCalculator() {
  const router = useRouter();

  const services = [
    {
      icon: '🚛',
      title: 'Перевозка',
      href: '/calculator/transport',
    },
    {
      icon: '♻️',
      title: 'Перевозка + утилизация',
      href: '/calculator/disposal-auto',
    },
    {
      icon: '📍',
      title: 'Выбрать полигон',
      href: '/calculator/disposal-manual',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Рассчитать стоимость
      </h3>
      <p className="text-gray-600 mb-6">
        Выберите услугу и узнайте цену за 2 минуты
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {services.map((service) => (
          <button
            key={service.href}
            onClick={() => router.push(service.href)}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
          >
            <span className="text-3xl mb-2">{service.icon}</span>
            <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-700">
              {service.title}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg
          className="w-4 h-4 text-blue-600"
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
        <span>Расчёт займёт 2 минуты</span>
      </div>
    </div>
  );
}

export default MiniCalculator;
