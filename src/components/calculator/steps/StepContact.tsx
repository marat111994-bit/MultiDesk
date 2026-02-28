'use client';

import React, { useState } from 'react';
import { ContactData } from '@/lib/types/calculator';
import { formatPhone, cleanPhone, validateEmail } from '@/lib/utils/calculator';

interface StepContactProps {
  formData: { contact: ContactData };
  onChange: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepContact({ formData, onChange, onNext, onBack }: StepContactProps) {
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('contact.name', value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    onChange('contact.phone', formatted);
    if (formatted.length >= 18) { // +7 (XXX) XXX-XX-XX
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange('contact.email', value);
    if (validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};

    if (!formData.contact.name.trim()) {
      newErrors.name = 'Введите имя';
    }

    const clean = cleanPhone(formData.contact.phone);
    if (clean.length < 11) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (!validateEmail(formData.contact.email)) {
      newErrors.email = 'Введите корректный email';
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Ваше имя *
        </label>
        <input
          type="text"
          id="name"
          value={formData.contact.name}
          onChange={handleNameChange}
          placeholder="Иван Иванов"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Телефон *
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.contact.phone}
          onChange={handlePhoneChange}
          placeholder="+7 (___) ___-__-__"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.contact.email}
          onChange={handleEmailChange}
          placeholder="example@mail.ru"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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

export default StepContact;
