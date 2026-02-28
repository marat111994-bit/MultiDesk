'use client';

import React, { useState, useCallback } from 'react';
import { Polygon, SelectedOption } from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';
import { debounce } from '@/lib/utils/calculator';

interface StepPolygonManualProps {
  formData: {
    pickup: { coords: string };
    cargo: { fkkoCode: string; volume: number; unit: 't' | 'm3'; compaction: number };
    selectedOption?: SelectedOption;
  };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPolygonManual({ formData, onChange, onNext, onBack }: StepPolygonManualProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<Polygon | null>(null);
  const [calculationResult, setCalculationResult] = useState<{
    distanceKm: number;
    transportPrice: number;
    utilizationPrice: number;
    totalPrice: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPolygons = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setPolygons([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/calculator/polygons?search=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setPolygons(data.polygons || []);
        }
      } catch (err) {
        console.error('Error fetching polygons:', err);
        setError('Ошибка поиска полигонов');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchPolygons(value);
  };

  const handleSelectPolygon = async (polygon: Polygon) => {
    setSelectedPolygon(polygon);
    setCalculationResult(null);
    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/calculator/calculate-disposal-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupCoords: formData.pickup.coords,
          polygonId: polygon.id,
          fkkoCode: formData.cargo.fkkoCode,
          volume: formData.cargo.volume,
          unit: formData.cargo.unit,
          compaction: formData.cargo.compaction,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка расчёта стоимости');
      }

      const result = await response.json();

      setCalculationResult({
        distanceKm: result.distanceKm,
        transportPrice: result.transportPrice,
        utilizationPrice: result.utilizationPrice,
        totalPrice: result.totalPrice,
      });

      onChange('selectedOption', {
        polygonId: polygon.id,
        polygonName: polygon.name,
        polygonAddress: polygon.address,
        polygonCoords: polygon.coords,
        distanceKm: result.distanceKm,
        transportPrice: result.transportPrice,
        utilizationPrice: result.utilizationPrice,
        totalPrice: result.totalPrice,
      });
    } catch (err) {
      console.error('Error calculating disposal:', err);
      setError('Не удалось рассчитать стоимость');
      setSelectedPolygon(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNext = () => {
    if (calculationResult) {
      onNext();
    }
  };

  const canProceed = calculationResult !== null && !isCalculating;

  return (
    <div className="space-y-6">
      {/* Поиск полигона */}
      <div className="relative">
        <label htmlFor="polygonSearch" className="block text-sm font-medium text-gray-700 mb-2">
          Поиск полигона *
        </label>
        <input
          type="text"
          id="polygonSearch"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Введите название полигона или адрес (минимум 2 символа)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />

        {/* Выпадающий список результатов */}
        {(isLoading || polygons.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-3 text-gray-500 text-sm">Загрузка...</div>
            )}
            {polygons.map((polygon, index) => (
              <button
                key={polygon.id}
                onClick={() => handleSelectPolygon(polygon)}
                disabled={isCalculating}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50"
              >
                <p className="font-medium text-gray-900">{polygon.name}</p>
                <p className="text-gray-500 text-xs">{polygon.address}</p>
                {polygon.region && (
                  <p className="text-gray-400 text-xs">{polygon.region}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Выбранный полигон и результат */}
      {selectedPolygon && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedPolygon.name}</h4>
              <p className="text-sm text-gray-500">{selectedPolygon.address}</p>
            </div>
            {isCalculating && (
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            )}
          </div>

          {calculationResult && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="font-medium">
                  Расстояние: {Math.round(calculationResult.distanceKm)} км
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Перевозка</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(calculationResult.transportPrice)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Утилизация</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(calculationResult.utilizationPrice)}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Итого</p>
                  <p className="font-bold text-blue-700">
                    {formatPrice(calculationResult.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Подсказка, если ничего не найдено */}
      {!isLoading && polygons.length === 0 && searchQuery.length >= 2 && !selectedPolygon && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p>Начните вводить название полигона</p>
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isCalculating}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
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

export default StepPolygonManual;
