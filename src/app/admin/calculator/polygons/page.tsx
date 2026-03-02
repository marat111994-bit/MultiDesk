'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Plus, X } from 'lucide-react'
import { clsx } from 'clsx'

interface Polygon {
  id: string
  polygonId: string
  seqNo: number | null
  receiverName: string
  receiverInn: string | null
  facilityAddress: string
  facilityCoordinates: string | null
  region: string | null
  phone: string | null
  email: string | null
  kipNumber: string | null
  fkkoCodes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    utilizationTariffs: number
    calculations: number
  }
}

interface PolygonFormData {
  receiverName: string
  receiverInn: string
  facilityAddress: string
  facilityCoordinates: string
  region: string
  phone: string
  email: string
  kipNumber: string
  isActive: boolean
}

interface FormErrors {
  receiverName?: string
  facilityAddress?: string
  facilityCoordinates?: string
}

export default function AdminCalculatorPolygonsPage() {
  const [polygons, setPolygons] = useState<Polygon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [formData, setFormData] = useState<PolygonFormData>({
    receiverName: '',
    receiverInn: '',
    facilityAddress: '',
    facilityCoordinates: '',
    region: '',
    phone: '',
    email: '',
    kipNumber: '',
    isActive: true,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const validateCoordinates = (coords: string): boolean => {
    return /^\d+\.\d+\s+\d+\.\d+$/.test(coords)
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.receiverName.trim()) {
      errors.receiverName = 'Название обязательно'
    }
    if (!formData.facilityAddress.trim()) {
      errors.facilityAddress = 'Адрес обязателен'
    }
    if (!formData.facilityCoordinates.trim()) {
      errors.facilityCoordinates = 'Координаты обязательны'
    } else if (!validateCoordinates(formData.facilityCoordinates)) {
      errors.facilityCoordinates = 'Формат: широта пробел долгота (55.438062 37.656374)'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOpenModal = () => {
    setFormData({
      receiverName: '',
      receiverInn: '',
      facilityAddress: '',
      facilityCoordinates: '',
      region: '',
      phone: '',
      email: '',
      kipNumber: '',
      isActive: true,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormErrors({})
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/calculator/polygons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (res.ok) {
        setToast({ type: 'success', message: `Полигон создан: ${result.polygonId}` })
        handleCloseModal()
        fetchPolygons()
      } else {
        setToast({ type: 'error', message: `Ошибка создания полигона: ${result.error || 'Неизвестная ошибка'}` })
      }
    } catch (error) {
      setToast({ type: 'error', message: `Ошибка создания полигона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` })
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: keyof PolygonFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field in formErrors) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const fetchPolygons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (isActiveFilter === 'active') params.set('isActive', 'true')
      if (isActiveFilter === 'inactive') params.set('isActive', 'false')

      const res = await fetch(`/api/admin/calculator/polygons?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPolygons(data)
      }
    } catch (error) {
      console.error('Error fetching polygons:', error)
    } finally {
      setLoading(false)
    }
  }, [search, isActiveFilter])

  useEffect(() => {
    fetchPolygons()
  }, [fetchPolygons])

  const handleToggleActive = async (polygon: Polygon) => {
    setUpdatingId(polygon.id)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygon.polygonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !polygon.isActive }),
      })
      if (res.ok) {
        setPolygons(polygons.map(p =>
          p.id === polygon.id ? { ...p, isActive: !p.isActive } : p
        ))
      }
    } catch (error) {
      console.error('Error toggling active:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredPolygons = polygons.filter(polygon => {
    const searchLower = search.toLowerCase()
    // Удаляем кавычки и префиксы из названия для поиска
    const cleanReceiverName = polygon.receiverName.toLowerCase()
      .replace(/["']/g, '')
      .replace(/^(ооо|ип|ао|пао)\s*/i, '')
    
    const matchesSearch = search === '' ||
      cleanReceiverName.includes(searchLower) ||
      polygon.facilityAddress.toLowerCase().includes(searchLower) ||
      polygon.region?.toLowerCase().includes(searchLower) ||
      polygon.polygonId.toLowerCase().includes(searchLower)

    const matchesActive = isActiveFilter === 'all' ||
      (isActiveFilter === 'active' && polygon.isActive) ||
      (isActiveFilter === 'inactive' && !polygon.isActive)

    return matchesSearch && matchesActive
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Полигоны утилизации</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление полигонами и тарифами
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Добавить полигон
        </button>
      </div>

      {/* Toast уведомления */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-sm animate-fade-in">
          <div
            className={clsx(
              'rounded-lg p-4 shadow-lg',
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 text-sm">{toast.message}</div>
              <button
                onClick={() => setToast(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры и поиск */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Поиск</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название, адрес, регион..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Статус:</span>
            <button
              onClick={() => setIsActiveFilter('all')}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium',
                isActiveFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Все
            </button>
            <button
              onClick={() => setIsActiveFilter('active')}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium',
                isActiveFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Активные
            </button>
            <button
              onClick={() => setIsActiveFilter('inactive')}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium',
                isActiveFilter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Неактивные
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Найдено: {filteredPolygons.length} из {polygons.length}
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ID полигона
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Адрес
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Регион
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Тарифов
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Активен
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Загрузка...
                </td>
              </tr>
            ) : filteredPolygons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Полигонов не найдено
                </td>
              </tr>
            ) : (
              filteredPolygons.map((polygon) => (
                <tr
                  key={polygon.id}
                  className={clsx(
                    'cursor-pointer hover:bg-gray-50',
                    !polygon.isActive && 'bg-gray-50 opacity-75'
                  )}
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/calculator/polygons/${polygon.polygonId}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{polygon.polygonId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/calculator/polygons/${polygon.polygonId}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-900"
                    >
                      {polygon.receiverName}
                    </Link>
                    {polygon.receiverInn && (
                      <p className="text-xs text-gray-500">ИНН: {polygon.receiverInn}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{polygon.facilityAddress}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{polygon.region || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {polygon._count.utilizationTariffs}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleActive(polygon)
                      }}
                      disabled={updatingId === polygon.id}
                      className={clsx(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                        updatingId === polygon.id ? 'opacity-50' : '',
                        polygon.isActive ? 'bg-green-500' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={clsx(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          polygon.isActive ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно создания полигона */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Затемнение фона */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseModal}
          />
          
          {/* Модальное окно */}
          <div className="relative z-50 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            {/* Заголовок */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Новый полигон</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Форма */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => handleInputChange('receiverName', e.target.value)}
                  placeholder='ООО "Название"'
                  className={clsx(
                    'mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                    formErrors.receiverName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  )}
                />
                {formErrors.receiverName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.receiverName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ИНН</label>
                <input
                  type="text"
                  value={formData.receiverInn}
                  onChange={(e) => handleInputChange('receiverInn', e.target.value)}
                  placeholder="1234567890"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Адрес <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.facilityAddress}
                  onChange={(e) => handleInputChange('facilityAddress', e.target.value)}
                  placeholder="Московская область, г. Домодедово..."
                  className={clsx(
                    'mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                    formErrors.facilityAddress
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  )}
                />
                {formErrors.facilityAddress && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.facilityAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Координаты <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.facilityCoordinates}
                  onChange={(e) => handleInputChange('facilityCoordinates', e.target.value)}
                  placeholder="55.438062 37.656374"
                  className={clsx(
                    'mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                    formErrors.facilityCoordinates
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">Подсказка: широта пробел долгота</p>
                {formErrors.facilityCoordinates && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.facilityCoordinates}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Регион</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  placeholder="Московская область"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Телефон</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="8 (495) 123-45-67"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="info@company.ru"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Номер КИО</label>
                <input
                  type="text"
                  value={formData.kipNumber}
                  onChange={(e) => handleInputChange('kipNumber', e.target.value)}
                  placeholder="123"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => handleInputChange('isActive', true)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Активен</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => handleInputChange('isActive', false)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Неактивен</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isCreating}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isCreating ? 'Создание...' : 'Создать полигон'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
