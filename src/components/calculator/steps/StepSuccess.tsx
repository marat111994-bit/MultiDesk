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
  // Используем calculationId (наш формат CD-ДДММГГ-NNN), а не applicationId (CUID)
  const applicationId = formData.calculationId || formData.applicationId || null;

  const handleDownloadPdf = () => {
    if (applicationId) {
      window.open(`/api/calculator/pdf/${applicationId}`, '_blank');
    }
  };

  const handleNewCalculation = () => {
    router.push('/calculator');
  };

  // Получаем данные маршрута
  const pickupAddress = formData.pickup?.address || '';
  const dropoffAddress = formData.dropoff?.address || formData.selectedOption?.polygonAddress || '';
  const distanceKm = formData.result?.distanceKm || formData.selectedOption?.distanceKm || 0;
  const totalPrice = formData.result?.totalPrice || formData.selectedOption?.totalPrice || 0;

  return (
    <div className="space-y-6">
      {/* Заголовок с галочкой */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Заявка принята</h2>
        <p className="text-gray-600">Мы свяжемся с вами в ближайшее время</p>
      </div>

      {/* Номер заявки */}
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-sm text-gray-500 mb-2">Номер заявки</p>
        <p className="text-3xl font-bold text-gray-900">{applicationId}</p>
      </div>

      {/* Маршрут */}
      {(pickupAddress || dropoffAddress) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-3">Маршрут</p>
          <div className="space-y-2">
            {pickupAddress && (
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">A</span>
                <p className="text-gray-900">{pickupAddress}</p>
              </div>
            )}
            {dropoffAddress && (
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">B</span>
                <p className="text-gray-900">{dropoffAddress}</p>
              </div>
            )}
            {distanceKm > 0 && (
              <div className="flex items-center gap-2 pt-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>Расстояние: {Math.round(distanceKm)} км</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Итоговая стоимость */}
      {totalPrice > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Итоговая стоимость</p>
          <p className="text-3xl font-bold text-blue-700">
            {formatPrice(totalPrice)}
          </p>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="space-y-3 pt-4">
        <button
          onClick={handleDownloadPdf}
          className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
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
          className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Новый расчёт
        </button>
      </div>
    </div>
  );
}

export default StepSuccess;
