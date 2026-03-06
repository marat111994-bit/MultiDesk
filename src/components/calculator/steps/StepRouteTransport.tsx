'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AddressData, TransportResult, CargoData, PolygonSearchResult } from '@/lib/types/calculator';
import { debounce, validateCoords, formatMode, formatPrice } from '@/lib/utils/calculator';

interface AddressSuggestion {
  value: string;
  coords: string;
}

interface StepRouteTransportProps {
  formData: {
    pickup: AddressData;
    dropoff?: AddressData;
    result?: TransportResult;
    cargo: CargoData;
  };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRouteTransport({ formData, onChange, onNext, onBack }: StepRouteTransportProps) {
  const [errors, setErrors] = useState<{
    pickupAddress?: string;
    pickupCoords?: string;
    dropoffAddress?: string;
    dropoffCoords?: string;
  }>({});
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [pickupCoordsError, setPickupCoordsError] = useState<string>('');
  const [dropoffCoordsError, setDropoffCoordsError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Переключатель типа выгрузки
  const [dropoffType, setDropoffType] = useState<'address' | 'polygon'>('address');

  // Поиск полигона
  const [polygonSearchQuery, setPolygonSearchQuery] = useState('');
  const [polygonSearchResults, setPolygonSearchResults] = useState<PolygonSearchResult[]>([]);
  const [isSearchingPolygons, setIsSearchingPolygons] = useState(false);
  const [showPolygonSuggestions, setShowPolygonSuggestions] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonSearchResult | null>(null);
  const polygonDropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие дропдауна полигонов при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (polygonDropdownRef.current && !polygonDropdownRef.current.contains(event.target as Node)) {
        setShowPolygonSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const fetchDropoffSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setDropoffSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/address/suggest/${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setDropoffSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching dropoff address suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const fetchPolygonSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setPolygonSearchResults([]);
        return;
      }

      setIsSearchingPolygons(true);
      try {
        const response = await fetch(`/api/calculator/polygons/search?search=${encodeURIComponent(query)}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setPolygonSearchResults(data);
          setShowPolygonSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching polygon suggestions:', error);
      } finally {
        setIsSearchingPolygons(false);
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

  const reverseGeocodeDropoff = useCallback(
    debounce(async (coords: string) => {
      const validation = validateCoords(coords);
      if (!validation.valid) {
        setDropoffCoordsError('Неверный формат координат');
        return;
      }

      setDropoffCoordsError('');
      setIsLoading(true);
      try {
        const response = await fetch(`/api/geocode/reverse?lat=${validation.lat}&lon=${validation.lon}`);
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            onChange('dropoff.address', data.address);
          }
        } else if (response.status === 404) {
          setDropoffCoordsError('Адрес по координатам не найден');
        }
      } catch (error) {
        console.error('Error reverse geocoding dropoff:', error);
        setDropoffCoordsError('Ошибка геокодирования');
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

  const handleDropoffAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('dropoff.address', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, dropoffAddress: undefined }));
    }
    fetchDropoffSuggestions(value);
    setShowDropoffSuggestions(true);
  };

  const handlePolygonSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPolygonSearchQuery(value);
    fetchPolygonSuggestions(value);
    setShowPolygonSuggestions(true);
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

  const handleDropoffCoordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('dropoff.coords', value);

    if (value.trim()) {
      const validation = validateCoords(value);
      if (!validation.valid) {
        setDropoffCoordsError('Неверный формат координат');
      } else {
        setDropoffCoordsError('');
        reverseGeocodeDropoff(value);
      }
    } else {
      setDropoffCoordsError('');
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

  const handleDropoffModeChange = (mode: 'day' | 'night' | '24') => {
    onChange('dropoff.mode', mode);
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

  const selectDropoffSuggestion = async (suggestion: AddressSuggestion) => {
    onChange('dropoff.address', suggestion.value);

    if (suggestion.coords) {
      const formattedCoords = suggestion.coords.includes(' ')
        ? suggestion.coords.replace(' ', ', ')
        : suggestion.coords;
      onChange('dropoff.coords', formattedCoords);
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    } else {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/address/geocode/${encodeURIComponent(suggestion.value)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.lat && data.lon) {
            onChange('dropoff.coords', `${data.lat}, ${data.lon}`);
          }
        }
      } catch (error) {
        console.error('Error geocoding dropoff address:', error);
      } finally {
        setIsLoading(false);
      }
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    }
  };

  const selectPolygon = (polygon: PolygonSearchResult) => {
    setSelectedPolygon(polygon);
    setPolygonSearchQuery(polygon.receiverName);
    setShowPolygonSuggestions(false);
    setPolygonSearchResults([]);

    // Подставляем адрес и координаты полигона в данные выгрузки
    onChange('dropoff.address', polygon.facilityAddress);
    
    if (polygon.facilityCoordinates) {
      const formattedCoords = polygon.facilityCoordinates.includes(' ')
        ? polygon.facilityCoordinates.replace(' ', ', ')
        : polygon.facilityCoordinates;
      onChange('dropoff.coords', formattedCoords);
    }

    // Режим работы берём из полигона (по умолчанию 24/7 если не указано)
    onChange('dropoff.mode', '24');
  };

  const clearPolygonSelection = () => {
    setSelectedPolygon(null);
    setPolygonSearchQuery('');
    setPolygonSearchResults([]);
    onChange('dropoff.address', '');
    onChange('dropoff.coords', '');
  };

  const handleDropoffTypeChange = (type: 'address' | 'polygon') => {
    setDropoffType(type);
    if (type === 'address') {
      clearPolygonSelection();
    } else {
      // При переключении на полигон очищаем ручной ввод
      onChange('dropoff.address', '');
      onChange('dropoff.coords', '');
    }
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const requestBody = {
        pickupCoords: formData.pickup.coords,
        dropoffCoords: formData.dropoff?.coords,
        volume: formData.cargo.volume,
        unit: formData.cargo.unit,
        compaction: formData.cargo.compaction,
      };

      const response = await fetch('/api/calculator/calculate-transport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка расчёта стоимости');
      }

      const result = await response.json();

      // Сохраняем результат через onChange
      onChange('result', {
        distanceKm: result.distanceKm,
        transportTariff: result.transportTariff,
        transportPrice: result.transportPrice,
        totalPrice: result.totalPrice,
      });

      // Переходим к следующему шагу
      onNext();
    } catch (err) {
      console.error('Error calculating transport:', err);
      setCalculationError('Не удалось рассчитать стоимость. Попробуйте позже.');
    } finally {
      setIsCalculating(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: {
      pickupAddress?: string;
      pickupCoords?: string;
      dropoffAddress?: string;
      dropoffCoords?: string;
    } = {};

    if (!formData.pickup.address.trim()) {
      newErrors.pickupAddress = 'Введите адрес погрузки';
    }

    if (!formData.pickup.coords) {
      newErrors.pickupCoords = 'Введите координаты или выберите адрес из подсказок';
    }

    if (!formData.dropoff?.address.trim()) {
      newErrors.dropoffAddress = 'Введите адрес выгрузки';
    }

    if (!formData.dropoff?.coords) {
      newErrors.dropoffCoords = 'Введите координаты или выберите адрес из подсказок';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canCalculate = formData.pickup.address.trim() && formData.pickup.coords &&
                       formData.dropoff?.address.trim() && formData.dropoff?.coords && !isCalculating;

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

      {/* БЛОК Б — Адрес выгрузки с переключателем */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏁</span> Адрес выгрузки *
        </h3>

        {/* Переключатель типа выгрузки */}
        <div className="mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => handleDropoffTypeChange('address')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                dropoffType === 'address'
                  ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>📍</span> Адрес
            </button>
            <button
              onClick={() => handleDropoffTypeChange('polygon')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                dropoffType === 'polygon'
                  ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🏭</span> Полигон
            </button>
          </div>
        </div>

        {dropoffType === 'address' ? (
          /* Режим "Адрес" — ручной ввод */
          <div className="space-y-4">
            {/* Адрес выгрузки */}
            <div className="relative">
              <label htmlFor="dropoffAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                id="dropoffAddress"
                value={formData.dropoff?.address || ''}
                onChange={handleDropoffAddressChange}
                onFocus={() => setShowDropoffSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
                placeholder="Начните вводить адрес..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.dropoffAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dropoffAddress && <p className="mt-1 text-sm text-red-600">{errors.dropoffAddress}</p>}

              {/* Выпадающий список подсказок */}
              {showDropoffSuggestions && (dropoffSuggestions.length > 0 || isLoading) && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoading && (
                    <div className="px-4 py-3 text-gray-500 text-sm">Загрузка...</div>
                  )}
                  {dropoffSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectDropoffSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion.value}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Координаты выгрузки */}
            <div>
              <label htmlFor="dropoffCoords" className="block text-sm font-medium text-gray-700 mb-2">
                Координаты
              </label>
              <input
                type="text"
                id="dropoffCoords"
                value={formatCoordsForInput(formData.dropoff?.coords || '')}
                onChange={handleDropoffCoordsChange}
                placeholder="55.7558, 37.6173"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  dropoffCoordsError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {dropoffCoordsError && <p className="mt-1 text-xs text-red-600">{dropoffCoordsError}</p>}
            </div>

            {/* Режим работы на выгрузке */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Режим работы
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDropoffModeChange('night')}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                    formData.dropoff?.mode === 'night'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">🌙</span>
                  <p className="text-xs font-medium mt-0.5">Ночь</p>
                </button>

                <button
                  onClick={() => handleDropoffModeChange('day')}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                    formData.dropoff?.mode === 'day'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">☀️</span>
                  <p className="text-xs font-medium mt-0.5">День</p>
                </button>

                <button
                  onClick={() => handleDropoffModeChange('24')}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                    formData.dropoff?.mode === '24'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">🔄</span>
                  <p className="text-xs font-medium mt-0.5">24/7</p>
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Выбрано: <span className="font-medium">{formatMode(formData.dropoff?.mode || '24')}</span>
              </p>
            </div>
          </div>
        ) : (
          /* Режим "Полигон" — поиск и выбор */
          <div className="space-y-4" ref={polygonDropdownRef}>
            <div className="relative">
              <label htmlFor="polygonSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Поиск полигона
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="polygonSearch"
                  value={polygonSearchQuery}
                  onChange={handlePolygonSearchChange}
                  onFocus={() => polygonSearchQuery.length >= 2 && setShowPolygonSuggestions(true)}
                  placeholder="Введите название, адрес, район..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                {isSearchingPolygons && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ⏳
                  </span>
                )}
              </div>

              {/* Выпадающий список полигонов */}
              {showPolygonSuggestions && (polygonSearchResults.length > 0 || isSearchingPolygons) && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {isSearchingPolygons && (
                    <div className="px-4 py-3 text-gray-500 text-sm">Загрузка...</div>
                  )}
                  {polygonSearchResults.map((polygon, index) => (
                    <button
                      key={index}
                      onClick={() => selectPolygon(polygon)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold text-gray-900 mb-1">
                        {polygon.receiverName}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        📍 {polygon.facilityAddress}
                      </div>
                      {polygon.region && (
                        <div className="text-xs text-gray-500">
                          🏛️ {polygon.region}
                        </div>
                      )}
                      {polygon.phone && (
                        <div className="text-xs text-gray-500 mt-1">
                          📞 {polygon.phone}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {showPolygonSuggestions && polygonSearchResults.length === 0 && polygonSearchQuery.length >= 2 && !isSearchingPolygons && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Полигоны не найдены
                </div>
              )}
            </div>

            {/* Карточка выбранного полигона */}
            {selectedPolygon && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-semibold text-gray-900">{selectedPolygon.receiverName}</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>📍 {selectedPolygon.facilityAddress}</div>
                      {selectedPolygon.region && <div>🏛️ {selectedPolygon.region}</div>}
                      {selectedPolygon.phone && <div>📞 {selectedPolygon.phone}</div>}
                      {selectedPolygon.email && <div>✉️ {selectedPolygon.email}</div>}
                      {selectedPolygon.facilityCoordinates && (
                        <div className="text-xs text-gray-500">
                          Координаты: {formatCoordsForInput(selectedPolygon.facilityCoordinates)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={clearPolygonSelection}
                    className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                    title="Изменить"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Подсказка */}
            {!selectedPolygon && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 Начните вводить название, адрес или район для поиска полигона. 
                  При выборе полигона адрес и координаты заполнятся автоматически.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ошибка расчёта */}
      {calculationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{calculationError}</p>
        </div>
      )}

      {/* Результат расчёта */}
      {formData.result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="font-semibold text-green-900">Маршрут рассчитан</h4>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-green-800">
              Расстояние: <span className="font-medium">{Math.round(formData.result.distanceKm)} км</span>
            </p>
            <p className="text-sm text-green-800">
              Стоимость перевозки: <span className="font-medium">{formatPrice(formData.result.transportPrice)}</span>
            </p>
            <div className="pt-2 border-t border-green-200">
              <p className="text-base font-bold text-green-900">
                ИТОГО: {formatPrice(formData.result.totalPrice)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isCalculating}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transform active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          ← Назад
        </button>
        <button
          onClick={handleCalculate}
          disabled={!canCalculate}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            canCalculate
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isCalculating ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Считаем маршрут...
            </>
          ) : (
            <>
              Рассчитать стоимость
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default StepRouteTransport;
