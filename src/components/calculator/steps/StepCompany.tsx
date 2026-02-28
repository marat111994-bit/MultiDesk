'use client';

import React, { useState } from 'react';
import { CompanyData } from '@/lib/types/calculator';
import { validateInn } from '@/lib/utils/calculator';

interface StepCompanyProps {
  formData: { company: CompanyData };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCompany({ formData, onChange, onNext, onBack }: StepCompanyProps) {
  const [errors, setErrors] = useState<{ name?: string; inn?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('company.name', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleInnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    onChange('company.inn', value);
    if (validateInn(value)) {
      setErrors((prev) => ({ ...prev, inn: undefined }));
    }
  };

  const handleKppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    onChange('company.kpp', value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('company.address', value);
  };

  const fetchCompanyByInn = async () => {
    const inn = formData.company.inn;
    if (inn.length !== 10 && inn.length !== 12) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/company?inn=${inn}`);
      if (response.ok) {
        const data = await response.json();
        if (data.name) {
          onChange('company.name', data.name);
        }
        if (data.address) {
          onChange('company.address', data.address);
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; inn?: string } = {};

    if (!formData.company.name.trim()) {
      newErrors.name = 'Введите название компании';
    }

    if (!validateInn(formData.company.inn)) {
      newErrors.inn = 'Введите корректный ИНН (10 или 12 цифр)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const canAutocomplete = formData.company.inn.length === 10 || formData.company.inn.length === 12;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="inn" className="block text-sm font-medium text-gray-700 mb-2">
          ИНН *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="inn"
            value={formData.company.inn}
            onChange={handleInnChange}
            onBlur={fetchCompanyByInn}
            placeholder="10 или 12 цифр"
            className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.inn ? 'border-red-500' : 'border-gray-300'
            } ${isLoading ? 'opacity-50' : ''}`}
            disabled={isLoading}
          />
          {canAutocomplete && !isLoading && (
            <button
              onClick={fetchCompanyByInn}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Найти
            </button>
          )}
        </div>
        {isLoading && <p className="mt-1 text-sm text-gray-500">Загрузка данных...</p>}
        {errors.inn && <p className="mt-1 text-sm text-red-600">{errors.inn}</p>}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Название компании *
        </label>
        <input
          type="text"
          id="name"
          value={formData.company.name}
          onChange={handleNameChange}
          placeholder='ООО "Пример"'
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="kpp" className="block text-sm font-medium text-gray-700 mb-2">
          КПП
        </label>
        <input
          type="text"
          id="kpp"
          value={formData.company.kpp}
          onChange={handleKppChange}
          placeholder="9 цифр"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Юридический адрес
        </label>
        <input
          type="text"
          id="address"
          value={formData.company.address}
          onChange={handleAddressChange}
          placeholder="г. Москва, ул. Примерная, д. 1"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
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

export default StepCompany;
