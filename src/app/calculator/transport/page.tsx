'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { StepCargo } from '@/components/calculator/steps/StepCargo';
import { StepRouteTransport } from '@/components/calculator/steps/StepRouteTransport';
import { StepContact } from '@/components/calculator/steps/StepContact';
import { StepSuccess } from '@/components/calculator/steps/StepSuccess';
import { FormData, createInitialFormData, TransportCalculation } from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';

const STEP_TITLES = [
  'Груз',
  'Маршрут',
  'Контакты',
  'Успех',
];

export default function TransportCalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(createInitialFormData());
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
    setStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Шаг 3 -> отправка заявки
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
          serviceType: 'transport',
          // Контакты
          contactName: formData.contact.name,
          contactPhone: formData.contact.phone,
          // Груз
          cargoName: formData.cargo.name,
          cargoCode: formData.cargo.code,
          fkkoCode: formData.cargo.fkkoCode,
          volume: formData.cargo.volume,
          unit: formData.cargo.unit,
          compaction: formData.cargo.compaction,
          // Погрузка
          pickupAddress: formData.pickup.address,
          pickupCoords: formData.pickup.coords,
          pickupMode: formData.pickup.mode,
          // Выгрузка
          dropoffAddress: formData.dropoff?.address,
          dropoffCoords: formData.dropoff?.coords,
          dropoffMode: formData.dropoff?.mode,
          // Результат расчёта
          distanceKm: formData.result?.distanceKm,
          transportTariff: formData.result?.transportTariff,
          transportPrice: formData.result?.transportPrice,
          totalPrice: formData.result?.totalPrice || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения заявки');
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        applicationId: data.id,
        calculationId: data.calculationId,
      }));

      setStep(4);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Не удалось сохранить заявку. Попробуйте позже.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const showToast = error !== null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepCargo
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <StepRouteTransport
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepContact
            formData={formData}
            onChange={handleChange}
            onNext={handleSubmitApplication}
            onBack={handleBack}
          />
        );
      case 4:
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

  const hideNext = step === 3 || step === 4;
  const hideBack = step === 1 || step === 4;

  const nextDisabled = isSubmitting;
  const nextLabel = isSubmitting ? 'Отправка...' : 'Далее';

  return (
    <>
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
        totalSteps={4}
        stepTitle={STEP_TITLES[step - 1]}
        onBack={handleBack}
        onNext={step === 3 ? handleSubmitApplication : handleNext}
        nextDisabled={nextDisabled}
        nextLabel={nextLabel}
        hideBack={hideBack}
        hideNext={hideNext}
      >
        {renderStep()}
      </CalculatorLayout>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Отправка заявки...</p>
          </div>
        </div>
      )}
    </>
  );
}
