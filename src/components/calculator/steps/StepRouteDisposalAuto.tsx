'use client';

import React, { useState, useCallback } from 'react';
import { AddressData, SelectedOption, Polygon } from '@/lib/types/calculator';
import { debounce, validateCoords, formatMode, formatPrice } from '@/lib/utils/calculator';

interface AddressSuggestion {
  value: string;
  coords: string;
}

interface StepRouteDisposalAutoProps {
  formData: {
    pickup: AddressData;
    cargo: { fkkoCode: string; volume: number; unit: 't' | 'm3'; compaction: number };
    selectedOption?: SelectedOption;
  };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRouteDisposalAuto({ formData, onChange, onNext, onBack }: StepRouteDisposalAutoProps) {
  const [errors, setErrors] = useState<{
    pickupAddress?: string;
    pickupCoords?: string;
  }>({});
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [pickupCoordsError, setPickupCoordsError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchPickupSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setPickupSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/address/suggest/${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setPickupSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching pickup address suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const reverseGeocodePickup = useCallback(
    debounce(async (coords: string) => {
      const validation = validateCoords(coords);
      if (!validation.valid) {
        setPickupCoordsError('Неверный формат координат');
        return;
      }

      setPickupCoordsError('');
      setIsLoading(true);
      try {
        const response = await fetch(`/api/geocode/reverse?lat=${validation.lat}&lon=${validation.lon}`);
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            onChange('pickup.address', data.address);
          }
        } else if (response.status === 404) {
          setPickupCoordsError('Адрес по координатам не найден');
        }
      } catch (error) {
        console.error('Error reverse geocoding pickup:', error);
        setPickupCoordsError('Ошибка геокодирования');
      } finally {
        setIsLoading(false);
      }
    }, 800),
    [onChange]
  );

  const handlePickupAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('pickup.address', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, pickupAddress: undefined }));
    }
    fetchPickupSuggestions(value);
    setShowPickupSuggestions(true);
  };

  const handlePickupCoordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('pickup.coords', value);

    if (value.trim()) {
      const validation = validateCoords(value);
      if (!validation.valid) {
        setPickupCoordsError('Неверный формат координат');
      } else {
        setPickupCoordsError('');
        reverseGeocodePickup(value);
      }
    } else {
      setPickupCoordsError('');
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

  const handlePickupModeChange = (mode: 'day' | 'night' | '24') => {
    onChange('pickup.mode', mode);
  };

  const selectPickupSuggestion = async (suggestion: AddressSuggestion) => {
    onChange('pickup.address', suggestion.value);

    if (suggestion.coords) {
      const formattedCoords = suggestion.coords.includes(' ')
        ? suggestion.coords.replace(' ', ', ')
        : suggestion.coords;
      onChange('pickup.coords', formattedCoords);
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    } else {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/address/geocode/${encodeURIComponent(suggestion.value)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.lat && data.lon) {
            onChange('pickup.coords', `${data.lat}, ${data.lon}`);
          }
        }
      } catch (error) {
        console.error('Error geocoding pickup address:', error);
      } finally {
        setIsLoading(false);
      }
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  };

  const handleSearchPolygons = async () => {
    if (!formData.pickup.coords || !formData.cargo.fkkoCode || formData.cargo.volume <= 0) {
      setSearchError('Заполните адрес погрузки и данные о грузе');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setPolygons([]);
    setSelectedId(null);

    try {
      const requestBody = {
        pickupCoords: formData.pickup.coords,
        fkkoCode: formData.cargo.fkkoCode,
        volume: formData.cargo.volume,
        unit: formData.cargo.unit,
        compaction: formData.cargo.compaction,
      };

      const response = await fetch('/api/calculator/calculate-disposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Ошибка поиска полигонов');
      }

      const polygonsList = responseData.options || responseData.polygons || [];
      setPolygons(polygonsList);

      // Выбираем первый (самый дешёвый) по умолчанию
      if (polygonsList.length > 0) {
        setSelectedId(polygonsList[0].polygonId);
        const first = polygonsList[0];
        onChange('selectedOption', {
          polygonId: first.polygonId,
          polygonName: first.polygonName,
          polygonAddress: first.polygonAddress,
          polygonCoords: first.polygonCoords,
          distanceKm: first.distanceKm,
          transportPrice: first.transportPrice,
          utilizationPrice: first.utilizationPrice,
          totalPrice: first.totalPrice,
        });
      }
    } catch (err) {
      console.error('Error searching polygons:', err);
      setSearchError('Не удалось найти полигоны. Попробуйте позже.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPolygon = (polygon: Polygon) => {
    setSelectedId(polygon.polygonId);
    onChange('selectedOption', {
      polygonId: polygon.polygonId,
      polygonName: polygon.polygonName,
      polygonAddress: polygon.polygonAddress,
      polygonCoords: polygon.polygonCoords,
      distanceKm: polygon.distanceKm,
      transportPrice: polygon.transportPrice,
      utilizationPrice: polygon.utilizationPrice,
      totalPrice: polygon.totalPrice,
    });
  };

  const validate = (): boolean => {
    const newErrors: { pickupAddress?: string; pickupCoords?: string } = {};

    if (!formData.pickup.address.trim()) {
      newErrors.pickupAddress = 'Введите адрес погрузки';
    }

    if (!formData.pickup.coords) {
      newErrors.pickupCoords = 'Введите координаты или выберите адрес из подсказок';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canSearch = formData.pickup.address.trim() && formData.pickup.coords && !isSearching;
  const canProceed = selectedId !== null && polygons.length > 0;

  return (
    <div className="space-y-6">
      {/* БЛОК А — Адрес погрузки */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📍</span> Адрес погрузки *
        </h3>

        <div className="space-y-4">
          {/* Адрес погрузки */}
          <div className="relative">
            <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Адрес
            </label>
            <input
              type="text"
              id="pickupAddress"
              value={formData.pickup.address}
              onChange={handlePickupAddressChange}
              onFocus={() => setShowPickupSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
              placeholder="Начните вводить адрес..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.pickupAddress && <p className="mt-1 text-sm text-red-600">{errors.pickupAddress}</p>}

            {/* Выпадающий список подсказок */}
            {showPickupSuggestions && (pickupSuggestions.length > 0 || isLoading) && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoading && (
                  <div className="px-4 py-3 text-gray-500 text-sm">Загрузка...</div>
                )}
                {pickupSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectPickupSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {suggestion.value}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Координаты погрузки */}
          <div>
            <label htmlFor="pickupCoords" className="block text-sm font-medium text-gray-700 mb-2">
              Координаты
            </label>
            <input
              type="text"
              id="pickupCoords"
              value={formatCoordsForInput(formData.pickup.coords)}
              onChange={handlePickupCoordsChange}
              placeholder="55.7558, 37.6173"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                pickupCoordsError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {pickupCoordsError && <p className="mt-1 text-xs text-red-600">{pickupCoordsError}</p>}
          </div>

          {/* Режим работы на погрузке */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Режим работы
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePickupModeChange('night')}
                className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                  formData.pickup.mode === 'night'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">🌙</span>
                <p className="text-xs font-medium mt-0.5">Ночь</p>
              </button>

              <button
                onClick={() => handlePickupModeChange('day')}
                className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                  formData.pickup.mode === 'day'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">☀️</span>
                <p className="text-xs font-medium mt-0.5">День</p>
              </button>

              <button
                onClick={() => handlePickupModeChange('24')}
                className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                  formData.pickup.mode === '24'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">🔄</span>
                <p className="text-xs font-medium mt-0.5">24/7</p>
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Выбрано: <span className="font-medium">{formatMode(formData.pickup.mode)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка поиска полигонов */}
      <div className="flex gap-4">
        <button
          onClick={handleSearchPolygons}
          disabled={!canSearch}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            canSearch
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSearching ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Ищем лучшие полигоны...
            </>
          ) : (
            <>
              Найти полигоны
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Ошибка поиска */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{searchError}</p>
        </div>
      )}

      {/* Карточки полигонов */}
      {polygons.length > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Найдено полигонов: <span className="font-semibold">{polygons.length}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polygons.map((polygon, index) => {
              const isSelected = selectedId === polygon.polygonId;
              const isBest = index === 0;

              return (
                <div
                  key={polygon.polygonId}
                  onClick={() => handleSelectPolygon(polygon)}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${isBest && !isSelected ? 'border-green-300 bg-green-50' : ''}`}
                >
                  {isBest && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                        ✓ Лучшая цена
                      </span>
                    </div>
                  )}

                  <h4 className="font-semibold text-gray-900 mb-1">{polygon.polygonName}</h4>
                  <p className="text-sm text-gray-500 mb-3">{polygon.polygonAddress}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
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
                    <span>{Math.round(polygon.distanceKm)} км</span>
                  </div>

                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Перевозка:</span>
                      <span className="font-medium">{formatPrice(polygon.transportPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Утилизация:</span>
                      <span className="font-medium">{formatPrice(polygon.utilizationPrice)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(polygon.totalPrice)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPolygon(polygon);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Выбрано' : 'Выбрать'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isSearching}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transform active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          ← Назад
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Далее
        </button>
      </div>
    </div>
  );
}

export default StepRouteDisposalAuto;
