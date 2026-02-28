'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { StepContact } from '@/components/calculator/steps/StepContact';
import { StepCompany } from '@/components/calculator/steps/StepCompany';
import { StepCargo } from '@/components/calculator/steps/StepCargo';
import { StepPickup } from '@/components/calculator/steps/StepPickup';
import { StepDropoff } from '@/components/calculator/steps/StepDropoff';
import { StepReviewTransport } from '@/components/calculator/steps/StepReviewTransport';
import { StepSuccess } from '@/components/calculator/steps/StepSuccess';
import {
  FormData,
  createInitialFormData,
  TransportCalculation,
} from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';

const STEP_TITLES = [
  'Контактные данные',
  'Данные компании',
  'Информация о грузе',
  'Адрес погрузки',
  'Адрес выгрузки',
  'Проверка данных',
  'Готово',
];

export default function TransportCalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(createInitialFormData());
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => {
      const keys = field.split('.');
      const newData = { ...prev };

      if (keys.length === 2) {
        const [parent, child] = keys;
        newData[parent as keyof FormData] = {
          ...(newData[parent as keyof FormData] as object),
          [child]: value,
        } as never;
      } else {
        newData[field as keyof FormData] = value as never;
      }

      return newData;
    });
  }, []);

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 7));
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Шаг 5 -> Шаг 6: расчёт перевозки
  const handleCalculateTransport = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/calculator/calculate-transport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupCoords: formData.pickup.coords,
          dropoffCoords: formData.dropoff?.coords,
          volume: formData.cargo.volume,
          unit: formData.cargo.unit,
          compaction: formData.cargo.compaction,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка расчёта стоимости');
      }

      const result: TransportCalculation = await response.json();

      // Сохраняем результат в formData
      setFormData((prev) => ({
        ...prev,
        result: {
          distanceKm: result.distanceKm,
          transportTariff: result.transportTariff,
          transportPrice: result.transportPrice,
          totalPrice: result.totalPrice,
        },
      }));

      setStep(6);
    } catch (err) {
      console.error('Error calculating transport:', err);
      setError('Не удалось рассчитать стоимость. Попробуйте позже.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsCalculating(false);
    }
  }, [formData]);

  // Шаг 6 -> Шаг 7: отправка заявки
  const handleSubmitApplication = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

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
          result: formData.result,
          totalPrice: formData.result?.totalPrice || 0,
          serviceType: 'transport',
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения заявки');
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        applicationId: data.id,
      }));

      setStep(7);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Не удалось сохранить заявку. Попробуйте позже.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Показываем тост с ошибкой
  const showToast = error !== null;

  // Рендеринг текущего шага
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepContact
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <StepCompany
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepCargo
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StepPickup
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <StepDropoff
            formData={formData}
            onChange={handleChange}
            onNext={handleCalculateTransport}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <StepReviewTransport
            formData={formData}
            onBack={handleBack}
            onSubmit={handleSubmitApplication}
            isSubmitting={isSubmitting}
          />
        );
      case 7:
        return (
          <StepSuccess
            formData={formData}
            onNewCalculation={() => router.push('/calculator')}
          />
        );
      default:
        return null;
    }
  };

  // Пропускаем навигационные кнопки на шагах 5 и 7
  const hideNext = step === 5 || step === 7;
  const hideBack = step === 1 || step === 7;

  // Для шага 5 показываем спиннер вместо кнопок
  const nextDisabled = isCalculating;
  const nextLabel = isCalculating ? 'Считаем маршрут...' : 'Далее';

  return (
    <>
      {/* Тост с ошибкой */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      <CalculatorLayout
        step={step}
        totalSteps={7}
        stepTitle={STEP_TITLES[step - 1]}
        onBack={handleBack}
        onNext={step === 5 ? handleCalculateTransport : handleNext}
        nextDisabled={nextDisabled}
        nextLabel={nextLabel}
        hideBack={hideBack}
        hideNext={hideNext}
      >
        {renderStep()}
      </CalculatorLayout>

      {/* Спиннер на шаге 5 */}
      {isCalculating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Считаем маршрут...</p>
            {formData.result && (
              <p className="text-gray-500 mt-2">
                {formatPrice(formData.result.totalPrice)}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
