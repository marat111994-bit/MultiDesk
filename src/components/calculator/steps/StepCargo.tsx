'use client';

import React, { useState } from 'react';
import { CargoData } from '@/lib/types/calculator';

interface StepCargoProps {
  formData: { cargo: CargoData };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCargo({ formData, onChange, onNext, onBack }: StepCargoProps) {
  const [errors, setErrors] = useState<{ name?: string; fkkoCode?: string; volume?: string }>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('cargo.name', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('cargo.code', value);
  };

  const handleFkkoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('cargo.fkkoCode', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, fkkoCode: undefined }));
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
    const value = parseFloat(e.target.value) || 1;
    onChange('cargo.compaction', value);
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; fkkoCode?: string; volume?: string } = {};

    if (!formData.cargo.name.trim()) {
      newErrors.name = 'Введите название груза';
    }

    if (!formData.cargo.fkkoCode.trim()) {
      newErrors.fkkoCode = 'Введите код ФККО';
    }

    if (formData.cargo.volume <= 0) {
      newErrors.volume = 'Введите объём больше 0';
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
      <div>
        <label htmlFor="cargoName" className="block text-sm font-medium text-gray-700 mb-2">
          Название груза *
        </label>
        <input
          type="text"
          id="cargoName"
          value={formData.cargo.name}
          onChange={handleNameChange}
          placeholder="ТКО, строительные отходы и т.д."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fkkoCode" className="block text-sm font-medium text-gray-700 mb-2">
            Код ФККО *
          </label>
          <input
            type="text"
            id="fkkoCode"
            value={formData.cargo.fkkoCode}
            onChange={handleFkkoChange}
            placeholder="7 00 000 00 00 0"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.fkkoCode ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fkkoCode && <p className="mt-1 text-sm text-red-600">{errors.fkkoCode}</p>}
        </div>

        <div>
          <label htmlFor="cargoCode" className="block text-sm font-medium text-gray-700 mb-2">
            Код груза (внутренний)
          </label>
          <input
            type="text"
            id="cargoCode"
            value={formData.cargo.code}
            onChange={handleCodeChange}
            placeholder="Необязательно"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

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

      <div>
        <label htmlFor="compaction" className="block text-sm font-medium text-gray-700 mb-2">
          Коэффициент уплотнения
        </label>
        <input
          type="number"
          id="compaction"
          value={formData.cargo.compaction}
          onChange={handleCompactionChange}
          min="0.1"
          step="0.1"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        <p className="mt-1 text-sm text-gray-500">
          Значение по умолчанию: 1.0. Укажите меньше для лёгких грузов (например, 0.3 для пластика).
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

export default StepCargo;
