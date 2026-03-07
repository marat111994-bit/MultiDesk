'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FormData } from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';

interface StepSuccessProps {
  formData: FormData;
  onNewCalculation: () => void;
}

export function StepSuccess({ formData, onNewCalculation }: StepSuccessProps) {
  const router = useRouter();
  const applicationId = formData.calculationId || formData.applicationId || null;

  const handleDownloadPdf = () => {
    if (applicationId) {
      window.open(`/api/calculator/pdf/${applicationId}`, '_blank');
    }
  };

  const handleNewCalculation = () => {
    router.push('/calculator');
  };

  // Данные маршрута
  const pickupAddress = formData.pickup?.address || '';
  const dropoffAddress = formData.dropoff?.address || formData.selectedOption?.polygonAddress || '';
  const distanceKm = formData.result?.distanceKm || formData.selectedOption?.distanceKm || 0;
  const totalPrice = formData.result?.totalPrice || formData.selectedOption?.totalPrice || 0;

  // Разбивка стоимости для режима "перевозка + утилизация"
  const isDisposalMode = !!formData.selectedOption;
  const transportPrice = formData.result?.transportPrice || formData.selectedOption?.transportPrice || 0;
  const utilizationPrice = formData.selectedOption?.utilizationPrice || 0;

  // Данные груза
  const cargoName = formData.cargo?.name || '';
  const cargoVolume = formData.cargo?.volume || 0;
  const cargoUnit = formData.cargo?.unit || '';

  return (
    <div className="max-w-md mx-auto">
      {/* Галочка и заголовок */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-checkmark">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Заявка принята</h2>
        <p className="text-gray-600">Мы свяжемся с вами в ближайшее время</p>
      </div>

      {/* Номер заявки — компактно в одну строку */}
      {applicationId && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm">
            <span className="text-gray-500">Номер заявки: </span>
            <span className="font-semibold text-gray-900">{applicationId}</span>
          </p>
        </div>
      )}

      {/* Блок маршрута и груза */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="font-medium text-gray-900">Маршрут</h3>
        </div>

        <div className="space-y-2 mb-3">
          {pickupAddress && (
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                A
              </span>
              <p className="text-sm text-gray-700">{pickupAddress}</p>
            </div>
          )}
          {dropoffAddress && (
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
                B
              </span>
              <p className="text-sm text-gray-700">{dropoffAddress}</p>
            </div>
          )}
          {distanceKm > 0 && (
            <div className="flex items-center gap-2 pt-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span>Расстояние: {Math.round(distanceKm)} км</span>
            </div>
          )}
        </div>

        {/* Информация о грузе */}
        {(cargoName || cargoVolume > 0) && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="font-medium text-gray-900">Груз</h3>
            </div>
            <p className="text-sm text-gray-700">
              {cargoName && <span>{cargoName}</span>}
              {cargoVolume > 0 && (
                <span className="text-gray-500">
                  {cargoName && ', '}
                  {cargoVolume} {cargoUnit || 'т'}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Итоговая стоимость */}
      {totalPrice > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          {isDisposalMode ? (
            // Режим "перевозка + утилизация" — показываем разбивку
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Стоимость перевозки</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(transportPrice)}
                </p>
              </div>
              
              <div className="border-b border-dashed border-gray-200" />
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Стоимость утилизации</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(utilizationPrice)}
                </p>
              </div>
              
              <div className="border-b border-gray-300" />
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Итоговая стоимость</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>
          ) : (
            // Режим "только перевозка" — показываем только итог
            <div>
              <p className="text-sm text-gray-600 mb-1">Итоговая стоимость</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(totalPrice)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Кнопки действий */}
      <div className="space-y-3">
        <button
          onClick={handleDownloadPdf}
          className="w-full px-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Скачать КП (PDF)
        </button>

        <button
          onClick={handleNewCalculation}
          className="w-full px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Новый расчёт
        </button>
      </div>

      {/* CSS анимация для галочки */}
      <style jsx>{`
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-checkmark {
          animation: checkmark 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default StepSuccess;
