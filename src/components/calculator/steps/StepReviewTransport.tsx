'use client';

import React from 'react';
import { FormData } from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';

interface StepReviewTransportProps {
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function StepReviewTransport({
  formData,
  onBack,
  onSubmit,
  isSubmitting = false,
}: StepReviewTransportProps) {
  const { contact, company, cargo, pickup, dropoff, result } = formData;

  return (
    <div className="space-y-6">
      {/* Карточка-сводка */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Проверка данных</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Контакт */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Контакт</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Имя</p>
                <p className="text-gray-900">{contact.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Телефон</p>
                <p className="text-gray-900">{contact.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-gray-900">{contact.email}</p>
              </div>
            </div>
          </div>

          {/* Компания */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Компания</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Название</p>
                <p className="text-gray-900">{company.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ИНН</p>
                <p className="text-gray-900">{company.inn || '—'}</p>
              </div>
              {company.kpp && (
                <div>
                  <p className="text-sm text-gray-400">КПП</p>
                  <p className="text-gray-900">{company.kpp}</p>
                </div>
              )}
              {company.address && (
                <div>
                  <p className="text-sm text-gray-400">Адрес</p>
                  <p className="text-gray-900">{company.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Груз */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Груз</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Название</p>
                <p className="text-gray-900">{cargo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Код ФККО</p>
                <p className="text-gray-900">{cargo.fkkoCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Объём</p>
                <p className="text-gray-900">
                  {cargo.volume} {cargo.unit === 't' ? 'т' : 'м³'}
                  {cargo.compaction !== 1 && ` (K=${cargo.compaction})`}
                </p>
              </div>
            </div>
          </div>

          {/* Маршрут */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Маршрут</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs font-bold">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Погрузка</p>
                  <p className="text-gray-900">{pickup.address}</p>
                  <p className="text-sm text-gray-500">
                    {pickup.mode === 'day' ? 'День' : pickup.mode === 'night' ? 'Ночь' : '24/7'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">B</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Выгрузка</p>
                  <p className="text-gray-900">{dropoff?.address}</p>
                  <p className="text-sm text-gray-500">
                    {dropoff?.mode === 'day' ? 'День' : dropoff?.mode === 'night' ? 'Ночь' : '24/7'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Расстояние */}
          {result && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span className="font-medium">
                  Расстояние: {Math.round(result.distanceKm)} км
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Итого */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Стоимость перевозки</p>
              {result && (
                <p className="text-lg font-medium text-gray-900">
                  {formatPrice(result.transportPrice)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">ИТОГО</p>
              {result && (
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(result.totalPrice)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Назад
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Отправка...
            </>
          ) : (
            <>
              Отправить заявку
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default StepReviewTransport;
