'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { StepCargo } from '@/components/calculator/steps/StepCargo';
import { StepRouteDisposalManual } from '@/components/calculator/steps/StepRouteDisposalManual';
import { StepContact } from '@/components/calculator/steps/StepContact';
import { StepSuccess } from '@/components/calculator/steps/StepSuccess';
import { FormData, createInitialFormData } from '@/lib/types/calculator';

const STEP_TITLES = [
  'Груз',
  'Маршрут',
  'Контакты',
  'Успех',
];

export default function DisposalManualCalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(createInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const formDataRef = useRef<FormData>(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

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

  const handleSubmitApplication = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const current = formDataRef.current;
      const response = await fetch('/api/calculator/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: 'transport_disposal_manual',
          contactName: current.contact.name,
          contactPhone: current.contact.phone,
          cargoName: current.cargo.name,
          cargoCode: current.cargo.code,
          fkkoCode: current.cargo.fkkoCode,
          volume: current.cargo.volume,
          unit: current.cargo.unit,
          compaction: current.cargo.compaction,
          pickupAddress: current.pickup.address,
          pickupCoords: current.pickup.coords,
          pickupMode: current.pickup.mode,
          polygonId: current.selectedOption?.polygonId || null,
          polygonName: current.selectedOption?.polygonName || null,
          polygonAddress: current.selectedOption?.polygonAddress || null,
          polygonCoords: current.selectedOption?.polygonCoords || null,
          distanceKm: current.selectedOption?.distanceKm || null,
          transportPrice: current.selectedOption?.transportPrice || null,
          utilizationPrice: current.selectedOption?.utilizationPrice || null,
          totalPrice: current.selectedOption?.totalPrice || 0,
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
  }, []);

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
          <StepRouteDisposalManual
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
