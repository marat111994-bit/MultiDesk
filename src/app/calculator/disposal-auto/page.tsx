'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { StepContact } from '@/components/calculator/steps/StepContact';
import { StepCompany } from '@/components/calculator/steps/StepCompany';
import { StepCargo } from '@/components/calculator/steps/StepCargo';
import { StepPickup } from '@/components/calculator/steps/StepPickup';
import { StepPolygonsAuto } from '@/components/calculator/steps/StepPolygonsAuto';
import { StepReviewDisposal } from '@/components/calculator/steps/StepReviewDisposal';
import { StepSuccess } from '@/components/calculator/steps/StepSuccess';
import { FormData, createInitialFormData } from '@/lib/types/calculator';

const STEP_TITLES = [
  'Контактные данные',
  'Данные компании',
  'Информация о грузе',
  'Адрес погрузки',
  'Выбор полигона',
  'Проверка данных',
  'Готово',
];

export default function DisposalAutoCalculatorPage() {
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
    setStep((prev) => Math.min(prev + 1, 7));
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

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
          selectedOption: formData.selectedOption,
          totalPrice: formData.selectedOption?.totalPrice || 0,
          serviceType: 'disposal-auto',
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
          <StepPolygonsAuto
            formData={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <StepReviewDisposal
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

  // Пропускаем навигационные кнопки на шаге 7
  const hideNext = step === 7;
  const hideBack = step === 1 || step === 7;

  return (
    <>
      {/* Тост с ошибкой */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
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
        onNext={handleNext}
        hideBack={hideBack}
        hideNext={hideNext}
      >
        {renderStep()}
      </CalculatorLayout>
    </>
  );
}
