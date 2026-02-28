'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData } from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';

interface StepSuccessProps {
  formData: FormData;
  onNewCalculation: () => void;
}

export function StepSuccess({ formData, onNewCalculation }: StepSuccessProps) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saveApplication = async () => {
      try {
        const response = await fetch('/api/calculator/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact: formData.contact,
            company: formData.company,
            cargo: formData.cargo,
            pickup: formData.pickup,
            dropoff: formData.dropoff,
            selectedOption: formData.selectedOption,
            result: formData.result,
            totalPrice: formData.result?.totalPrice || formData.selectedOption?.totalPrice || 0,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка сохранения заявки');
        }

        const data = await response.json();
        setApplicationId(data.id);
      } catch (err) {
        console.error('Error saving application:', err);
        setError('Не удалось сохранить заявку. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    saveApplication();
  }, [formData]);

  const handleDownloadPdf = () => {
    if (applicationId) {
      window.open(`/api/calculator/pdf/${applicationId}`, '_blank');
    }
  };

  const handleNewCalculation = () => {
    router.push('/calculator');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Сохранение заявки...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={handleNewCalculation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      {/* Зелёная галочка */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Заявка принята</h2>
      <p className="text-gray-600 mb-6">Мы свяжемся с вами в ближайшее время</p>

      {/* ID заявки */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <p className="text-sm text-gray-500 mb-2">Номер заявки</p>
        <p className="text-3xl font-bold text-gray-900">{applicationId}</p>
      </div>

      {/* Итоговая сумма */}
      {(formData.result?.totalPrice || formData.selectedOption?.totalPrice) && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Итоговая стоимость</p>
          <p className="text-3xl font-bold text-blue-700">
            {formatPrice(formData.result?.totalPrice || formData.selectedOption?.totalPrice || 0)}
          </p>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="space-y-3">
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
