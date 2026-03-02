'use client';

import React, { useState, useCallback } from 'react';
import { AddressData, AddressSuggestion } from '@/lib/types/calculator';
import { debounce } from '@/lib/utils/calculator';
import { formatMode } from '@/lib/utils/calculator';

interface StepDropoffProps {
  formData: { dropoff?: AddressData };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepDropoff({ formData, onChange, onNext, onBack }: StepDropoffProps) {
  const [errors, setErrors] = useState<{ address?: string }>({});
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/address/suggest/${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('dropoff.address', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleModeChange = (mode: 'day' | 'night' | '24') => {
    onChange('dropoff.mode', mode);
  };

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    onChange('dropoff.address', suggestion.value);

    // Если координаты есть в подсказке — используем их
    if (suggestion.coords) {
      onChange('dropoff.coords', suggestion.coords);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      // Иначе геокодируем адрес
      setIsLoading(true);
      try {
        const response = await fetch(`/api/address/geocode/${encodeURIComponent(suggestion.value)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.lat && data.lon) {
            onChange('dropoff.coords', `${data.lat} ${data.lon}`);
          }
        } else {
          // Fallback: если геокодирование не удалось, пробуем через адрес из input
          const addressValue = formData.dropoff?.address || '';
          if (addressValue.trim()) {
            const fallbackResponse = await fetch(`/api/address/geocode/${encodeURIComponent(addressValue)}`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.lat && fallbackData.lon) {
                onChange('dropoff.coords', `${fallbackData.lat} ${fallbackData.lon}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('[StepDropoff] Error geocoding address:', error);
      } finally {
        setIsLoading(false);
      }
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { address?: string } = {};

    if (!formData.dropoff?.address.trim()) {
      newErrors.address = 'Введите адрес выгрузки';
    }

    if (!formData.dropoff?.coords) {
      newErrors.address = 'Координаты не получены. Выберите адрес из подсказок и дождитесь геокодирования';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <label htmlFor="dropoffAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Адрес выгрузки *
        </label>
        <input
          type="text"
          id="dropoffAddress"
          value={formData.dropoff?.address || ''}
          onChange={handleAddressChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Начните вводить адрес..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}

        {/* Выпадающий список подсказок */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-3 text-gray-500 text-sm">Загрузка...</div>
            )}
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {suggestion.value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Режим работы на выгрузке
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleModeChange('night')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              formData.dropoff?.mode === 'night'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">🌙</span>
            <p className="text-sm font-medium mt-1">Ночь</p>
            <p className="text-xs text-gray-500">20:00-08:00</p>
          </button>

          <button
            onClick={() => handleModeChange('day')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              formData.dropoff?.mode === 'day'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">☀️</span>
            <p className="text-sm font-medium mt-1">День</p>
            <p className="text-xs text-gray-500">08:00-20:00</p>
          </button>

          <button
            onClick={() => handleModeChange('24')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              formData.dropoff?.mode === '24'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">🔄</span>
            <p className="text-sm font-medium mt-1">24/7</p>
            <p className="text-xs text-gray-500">Круглосуточно</p>
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Выбрано: <span className="font-medium">{formatMode(formData.dropoff?.mode || '24')}</span>
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Далее
        </button>
      </div>
    </div>
  );
}

export default StepDropoff;
