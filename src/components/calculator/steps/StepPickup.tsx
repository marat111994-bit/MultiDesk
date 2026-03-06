'use client';

import React, { useState, useCallback } from 'react';
import { AddressData, AddressSuggestion } from '@/lib/types/calculator';
import { debounce, validateCoords } from '@/lib/utils/calculator';
import { formatMode } from '@/lib/utils/calculator';

interface StepPickupProps {
  formData: { pickup: AddressData };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPickup({ formData, onChange, onNext, onBack }: StepPickupProps) {
  const [errors, setErrors] = useState<{ address?: string; coords?: string }>({});
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coordsError, setCoordsError] = useState<string>('');

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

  const reverseGeocode = useCallback(
    debounce(async (coords: string) => {
      const validation = validateCoords(coords);
      if (!validation.valid) {
        setCoordsError('Неверный формат координат');
        return;
      }

      setCoordsError('');
      setIsLoading(true);
      try {
        const response = await fetch(`/api/geocode/reverse?lat=${validation.lat}&lon=${validation.lon}`);
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            onChange('pickup.address', data.address);
          }
        } else if (response.status === 404) {
          setCoordsError('Адрес по координатам не найден');
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setCoordsError('Ошибка геокодирования');
      } finally {
        setIsLoading(false);
      }
    }, 800),
    [onChange]
  );

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('pickup.address', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleCoordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('pickup.coords', value);

    if (value.trim()) {
      const validation = validateCoords(value);
      if (!validation.valid) {
        setCoordsError('Неверный формат координат');
      } else {
        setCoordsError('');
        reverseGeocode(value);
      }
    } else {
      setCoordsError('');
    }
  };

  const formatCoordsForInput = (coords: string): string => {
    if (!coords) return '';
    const parts = coords.split(/[\s,]+/).filter(Boolean);
    if (parts.length === 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return coords;
  };

  const handleModeChange = (mode: 'day' | 'night' | '24') => {
    onChange('pickup.mode', mode);
  };

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    onChange('pickup.address', suggestion.value);

    // Если координаты есть в подсказке — используем их
    if (suggestion.coords) {
      const formattedCoords = suggestion.coords.includes(' ')
        ? suggestion.coords.replace(' ', ', ')
        : suggestion.coords;
      onChange('pickup.coords', formattedCoords);
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
            onChange('pickup.coords', `${data.lat}, ${data.lon}`);
          }
        } else {
          // Fallback: если геокодирование не удалось, пробуем через адрес из input
          const addressValue = formData.pickup.address;
          if (addressValue.trim()) {
            const fallbackResponse = await fetch(`/api/address/geocode/${encodeURIComponent(addressValue)}`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.lat && fallbackData.lon) {
                onChange('pickup.coords', `${fallbackData.lat}, ${fallbackData.lon}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      } finally {
        setIsLoading(false);
      }
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { address?: string; coords?: string } = {};

    if (!formData.pickup.address.trim()) {
      newErrors.address = 'Введите адрес погрузки';
    }

    if (!formData.pickup.coords) {
      newErrors.coords = 'Введите координаты или выберите адрес из подсказок';
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
        <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Адрес погрузки *
        </label>
        <input
          type="text"
          id="pickupAddress"
          value={formData.pickup.address}
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
            {!isLoading && suggestions.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-sm">Нет подсказок</div>
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
        <label htmlFor="pickupCoords" className="block text-sm font-medium text-gray-700 mb-2">
          Координаты
        </label>
        <input
          type="text"
          id="pickupCoords"
          value={formatCoordsForInput(formData.pickup.coords)}
          onChange={handleCoordsChange}
          placeholder="55.7558, 37.6173"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            coordsError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {coordsError && <p className="mt-1 text-xs text-red-600">{coordsError}</p>}
        {!coordsError && formData.pickup.coords && (
          <p className="mt-1 text-xs text-gray-500">Широта: 54.0-57.0, Долгота: 35.0-40.0</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Режим работы на погрузке
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleModeChange('night')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              formData.pickup.mode === 'night'
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
              formData.pickup.mode === 'day'
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
              formData.pickup.mode === '24'
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
          Выбрано: <span className="font-medium">{formatMode(formData.pickup.mode)}</span>
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transform active:scale-95 transition-all duration-150 cursor-pointer"
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

export default StepPickup;
