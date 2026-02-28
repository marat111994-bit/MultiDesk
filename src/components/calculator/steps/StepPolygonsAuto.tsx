'use client';

import React, { useEffect, useState } from 'react';
import { Polygon, SelectedOption } from '@/lib/types/calculator';
import { formatPrice } from '@/lib/utils/calculator';

interface StepPolygonsAutoProps {
  formData: {
    pickup: { coords: string };
    cargo: { fkkoCode: string; volume: number; unit: 't' | 'm3'; compaction: number };
    selectedOption?: SelectedOption;
  };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPolygonsAuto({ formData, onChange, onNext, onBack }: StepPolygonsAutoProps) {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolygons = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/calculator/calculate-disposal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pickupCoords: formData.pickup.coords,
            fkkoCode: formData.cargo.fkkoCode,
            volume: formData.cargo.volume,
            unit: formData.cargo.unit,
            compaction: formData.cargo.compaction,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка поиска полигонов');
        }

        const data = await response.json();
        setPolygons(data.polygons || []);

        // Выбираем первый (самый дешёвый) по умолчанию
        if (data.polygons && data.polygons.length > 0) {
          setSelectedId(data.polygons[0].id);
        }
      } catch (err) {
        console.error('Error fetching polygons:', err);
        setError('Не удалось найти полигоны. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolygons();
  }, [formData.pickup.coords, formData.cargo]);

  const handleSelect = (polygon: Polygon) => {
    setSelectedId(polygon.id);
    onChange('selectedOption', {
      polygonId: polygon.id,
      polygonName: polygon.name,
      polygonAddress: polygon.address,
      polygonCoords: polygon.coords,
      distanceKm: polygon.distanceKm,
      transportPrice: polygon.transportPrice,
      utilizationPrice: polygon.utilizationPrice,
      totalPrice: polygon.totalPrice,
    });
  };

  const handleNext = () => {
    if (selectedId) {
      onNext();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Ищем лучшие полигоны по цене...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
      </div>
    );
  }

  if (polygons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Полигоны не найдены</h3>
        <p className="text-gray-600 mb-6">
          К сожалению, не удалось найти полигоны для данного маршрута.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Найдено полигонов: <span className="font-semibold">{polygons.length}</span>
        </p>
      </div>

      {/* Grid с карточками полигонов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {polygons.map((polygon, index) => {
          const isSelected = selectedId === polygon.id;
          const isBest = index === 0; // Первый — самый дешёвый

          return (
            <div
              key={polygon.id}
              onClick={() => handleSelect(polygon)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              } ${isBest && !isSelected ? 'border-green-300 bg-green-50' : ''}`}
            >
              {/* Метка "Лучшая цена" */}
              {isBest && (
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                    ✓ Лучшая цена
                  </span>
                </div>
              )}

              {/* Название и адрес */}
              <h4 className="font-semibold text-gray-900 mb-1">{polygon.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{polygon.address}</p>

              {/* Расстояние */}
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
                <span>{Math.round(polygon.distanceKm)} км от точки погрузки</span>
              </div>

              {/* Цены */}
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

              {/* Итого */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(polygon.totalPrice)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(polygon);
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

      {/* Кнопки навигации */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedId}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedId
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

export default StepPolygonsAuto;
