'use client';

import React from 'react';

interface CalculatorLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  stepTitle: string;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  hideBack?: boolean;
  hideNext?: boolean;
}

export function CalculatorLayout({
  children,
  step,
  totalSteps,
  stepTitle,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = 'Далее',
  hideBack = false,
  hideNext = false,
}: CalculatorLayoutProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Прогрессбар */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Шаг {step} из {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{stepTitle}</h1>
        
        {children}
      </div>

      {/* Кнопки навигации */}
      {!hideNext && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4">
          <div className="max-w-2xl mx-auto px-4 flex gap-4">
            {!hideBack && (
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ← Назад
              </button>
            )}
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                nextDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculatorLayout;
