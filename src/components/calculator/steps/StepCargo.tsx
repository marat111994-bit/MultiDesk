'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CargoData } from '@/lib/types/calculator';

interface CargoSearchResult {
  fkkoCode: string | null;
  itemName: string;
  categoryCode: string;
  hazardClass: number;
}

interface StepCargoProps {
  formData: { cargo: CargoData };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCargo({ formData, onChange, onNext, onBack }: StepCargoProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CargoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<{ volume?: string; compaction?: string }>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce поиск при вводе
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/admin/calculator/cargo-items/search?q=${encodeURIComponent(searchQuery)}&limit=10`
          );
          if (response.ok) {
            const results = await response.json();
            setSearchResults(results);
            setShowDropdown(true);
          }
        } catch (error) {
          console.error('Ошибка поиска грузов:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCargoSelect = (item: CargoSearchResult) => {
    const cargoData = {
      name: item.itemName,
      fkkoCode: item.fkkoCode || '',
      code: item.fkkoCode || '',
      hazardClass: item.hazardClass,
      categoryCode: item.categoryCode,
      volume: formData.cargo.volume,
      unit: formData.cargo.unit,
      compaction: formData.cargo.compaction,
      isCustomCargo: false,
      customCargoName: '',
    };
    onChange('cargo', cargoData);
    setSearchQuery(item.fkkoCode ? `${item.fkkoCode} — ${item.itemName}` : item.itemName);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleCustomCargoUse = () => {
    const customName = searchQuery.trim();
    if (!customName) return;

    const cargoData = {
      name: customName,
      fkkoCode: '',
      code: '',
      hazardClass: undefined,
      categoryCode: '',
      volume: formData.cargo.volume,
      unit: formData.cargo.unit,
      compaction: formData.cargo.compaction,
      isCustomCargo: true,
      customCargoName: customName,
    };
    onChange('cargo', cargoData);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleClearCargo = () => {
    onChange('cargo', {
      name: '',
      fkkoCode: '',
      code: '',
      hazardClass: undefined,
      categoryCode: '',
      volume: formData.cargo.volume,
      unit: formData.cargo.unit,
      compaction: formData.cargo.compaction,
      isCustomCargo: false,
      customCargoName: '',
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Если поле очищено вручную — сбрасываем выбор груза
    if (!value.trim()) {
      handleClearCargo();
    } else {
      // Если начали вводить заново после выбора — сбрасываем
      onChange('cargo', {
        ...formData.cargo,
        name: '',
        fkkoCode: '',
        code: '',
        isCustomCargo: false,
        customCargoName: '',
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onChange('cargo.volume', value);
    if (value > 0) {
      setErrors((prev) => ({ ...prev, volume: undefined }));
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 't' | 'm3';
    onChange('cargo.unit', value);
  };

  const handleCompactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 1.0;
    onChange('cargo.compaction', value);
    if (value > 0) {
      setErrors((prev) => ({ ...prev, compaction: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { volume?: string; compaction?: string } = {};

    // Груз должен быть выбран (fkkoCode) ИЛИ введено название вручную
    const cargoSelected = formData.cargo.fkkoCode || formData.cargo.name;
    if (!cargoSelected) {
      setErrors((prev) => ({
        ...prev,
        volume: 'Выберите груз из списка или введите название вручную',
      }));
      return false;
    }

    if (formData.cargo.volume <= 0) {
      newErrors.volume = 'Введите объём больше 0';
    }

    if (formData.cargo.compaction <= 0) {
      newErrors.compaction = 'Введите коэффициент больше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const isCargoSelected = !!formData.cargo.fkkoCode || !!formData.cargo.name;
  const isInert = formData.cargo.categoryCode === 'INERT';
  const isCustomCargo = formData.cargo.isCustomCargo === true;

  // Обрезка названия до 70 символов
  const truncateName = (name: string, maxLength = 70) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 2) + '...';
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Блокируем табуляцию — она не должна закрывать dropdown или менять поведение
    if (e.key === 'Tab') {
      // Разрешаем стандартную табуляцию, но не закрываем dropdown принудительно
      return;
    }
    // Блокируем Enter — он не должен отправлять форму
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      {/* БЛОК 1: Умный поиск груза */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск груза *
        </label>

        {!isCargoSelected ? (
          <>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Введите код ФККО или название груза..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ⏳
                </span>
              )}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleCargoSelect(item)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">
                        {item.fkkoCode || 'Без ФККО'}
                      </span>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          {item.categoryCode}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                          кл. {item.hazardClass}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {truncateName(item.itemName)}
                    </div>
                  </button>
                ))}
                {/* Опция "Использовать своё название" */}
                <button
                  onClick={handleCustomCargoUse}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-t border-gray-200 bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <span className="text-blue-600">✏️</span>
                  <div>
                    <div className="font-medium text-blue-900">
                      Использовать: "{truncateName(searchQuery, 50)}"
                    </div>
                    <div className="text-xs text-blue-600">
                      Свой вариант (без ФККО)
                    </div>
                  </div>
                </button>
              </div>
            )}

            {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="text-center text-gray-500 mb-3">Ничего не найдено</div>
                <button
                  onClick={handleCustomCargoUse}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border border-gray-200 rounded-lg bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <span className="text-blue-600">✏️</span>
                  <div>
                    <div className="font-medium text-blue-900">
                      Использовать: "{truncateName(searchQuery, 50)}"
                    </div>
                    <div className="text-xs text-blue-600">
                      Свой вариант (без ФККО)
                    </div>
                  </div>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Карточка выбранного груза */
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600">✓</span>
                  {isCustomCargo ? (
                    <>
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded font-medium">
                        ✏️ Своё название
                      </span>
                      <span className="font-semibold text-gray-900">
                        {truncateName(formData.cargo.name, 100)}
                      </span>
                    </>
                  ) : (
                    <>
                      {formData.cargo.fkkoCode && (
                        <span className="font-semibold text-gray-900">
                          {formData.cargo.fkkoCode}
                        </span>
                      )}
                      {!formData.cargo.fkkoCode && isInert && (
                        <span className="font-semibold text-gray-900">
                          {formData.cargo.name}
                        </span>
                      )}
                    </>
                  )}
                  <div className="flex gap-2">
                    {!isCustomCargo && formData.cargo.categoryCode && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                        {formData.cargo.categoryCode}
                      </span>
                    )}
                    {!isCustomCargo && formData.cargo.hazardClass && (
                      <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                        Класс опасности: {formData.cargo.hazardClass}
                      </span>
                    )}
                    {isInert && !isCustomCargo && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                        Инертный материал
                      </span>
                    )}
                  </div>
                </div>
                {!isInert && formData.cargo.name && !isCustomCargo && (
                  <div className="text-sm text-gray-600 mt-1">
                    {truncateName(formData.cargo.name, 100)}
                  </div>
                )}
              </div>
              <button
                onClick={handleClearCargo}
                className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                title="Изменить"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* БЛОК 2: Объём */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
            Объём *
          </label>
          <input
            type="number"
            id="volume"
            value={formData.cargo.volume}
            onChange={handleVolumeChange}
            min="0"
            step="0.1"
            placeholder="0"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.volume ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.volume && <p className="mt-1 text-sm text-red-600">{errors.volume}</p>}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
            Единица измерения
          </label>
          <select
            id="unit"
            value={formData.cargo.unit}
            onChange={handleUnitChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="t">Тонны (т)</option>
            <option value="m3">Кубометры (м³)</option>
          </select>
        </div>
      </div>

      {/* БЛОК 3: Коэффициент уплотнения */}
      <div>
        <label htmlFor="compaction" className="block text-sm font-medium text-gray-700 mb-2">
          Коэффициент уплотнения (т/м³)
        </label>
        <input
          type="number"
          id="compaction"
          value={formData.cargo.compaction}
          onChange={handleCompactionChange}
          min="0.1"
          step="0.01"
          placeholder="1.0"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.compaction ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="mt-1 text-sm text-gray-500">
          Плотность груза в т/м³. Грунт ≈ 1.5–1.8 · Бетон ≈ 2.4 · Снег ≈ 0.3
        </p>
        {errors.compaction && <p className="mt-1 text-sm text-red-600">{errors.compaction}</p>}
      </div>

      {/* Кнопки навигации */}
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

export default StepCargo;
