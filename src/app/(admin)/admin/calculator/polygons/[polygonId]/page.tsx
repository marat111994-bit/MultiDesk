'use client'

import { useState, useEffect, use, useCallback, useRef } from 'react'
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
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
  utilizationTariffs: UtilizationTariff[]
}

interface UtilizationTariff {
  id: string
  fkkoCode: string
  polygonId: string
  tariffRubT: number
  itemName: string | null
  hazardClass: number | null
}

interface CargoItemSearchResult {
  fkkoCode: string
  itemName: string
  categoryCode: string
  hazardClass: number | null
}

interface PolygonParams {
  polygonId: string
}

interface EditableFieldProps {
  label: string
  value: string | null
  field: string
  editing: Record<string, boolean>
  editValues: Record<string, string>
  onEdit: (field: string, value: string | null) => void
  onSave: (field: string, value: string) => void
  onCancel: (field: string) => void
  onValueChange: (field: string, value: string) => void
  saving: boolean
  type?: 'text' | 'email' | 'tel'
}

function EditableField({
  label,
  value,
  field,
  editing,
  editValues,
  onEdit,
  onSave,
  onCancel,
  onValueChange,
  saving,
  type = 'text',
}: EditableFieldProps) {
  const isEditing = editing[field]
  const displayValue = value || '—'

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      {isEditing ? (
        <div className="mt-1 flex items-center space-x-2">
          <input
            type={type}
            value={editValues[field] || ''}
            onChange={(e) => onValueChange(field, e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
          <button
            onClick={() => onSave(field, editValues[field])}
            disabled={saving}
            className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onCancel(field)}
            className="rounded p-1 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-1 flex items-start justify-between">
          <p className="text-sm text-gray-900">{displayValue}</p>
          <button
            onClick={() => onEdit(field, value)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <Edit2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminCalculatorPolygonDetailPage({ params }: { params: Promise<PolygonParams> }) {
  const { polygonId } = use(params)
  const [polygon, setPolygon] = useState<Polygon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  // Тарифы
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CargoItemSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedCargo, setSelectedCargo] = useState<CargoItemSearchResult | null>(null)
  const [tariffValue, setTariffValue] = useState('')
  const [addingTariff, setAddingTariff] = useState(false)
  const [deletingTariff, setDeletingTariff] = useState<string | null>(null)
  const [editingTariff, setEditingTariff] = useState<string | null>(null)
  const [editingTariffValue, setEditingTariffValue] = useState('')
  const [tariffFilter, setTariffFilter] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPolygon()
  }, [polygonId])

  useEffect(() => {
    // Закрытие dropdown при клике вне
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Поиск с debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/admin/calculator/cargo-items/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
          setShowDropdown(true)
        }
      } catch (error) {
        console.error('Error searching cargo items:', error)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const fetchPolygon = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygonId}`)
      if (res.ok) {
        const data = await res.json()
        setPolygon(data)
      }
    } catch (error) {
      console.error('Error fetching polygon:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateField = async (field: string, value: string | boolean) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        setPolygon(prev => prev ? { ...prev, [field]: value } : null)
        setEditing(prev => ({ ...prev, [field]: false }))
      }
    } catch (error) {
      console.error('Error updating field:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectCargo = (cargo: CargoItemSearchResult) => {
    setSelectedCargo(cargo)
    setSearchQuery(`${cargo.fkkoCode} — ${cargo.itemName.substring(0, 50)}${cargo.itemName.length > 50 ? '...' : ''}`)
    setShowDropdown(false)
    setSearchResults([])
  }

  const handleAddTariff = async () => {
    if (!selectedCargo || !tariffValue) return
    setAddingTariff(true)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygonId}/tariffs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fkkoCode: selectedCargo.fkkoCode,
          tariffRubT: parseFloat(tariffValue),
        }),
      })
      if (res.ok) {
        setSearchQuery('')
        setSelectedCargo(null)
        setTariffValue('')
        await fetchPolygon()
      }
    } catch (error) {
      console.error('Error adding tariff:', error)
    } finally {
      setAddingTariff(false)
    }
  }

  const handleDeleteTariff = async (tariffId: string, fkkoCode: string) => {
    if (!confirm(`Удалить тариф для ФККО ${fkkoCode}?`)) return
    setDeletingTariff(tariffId)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygonId}/tariffs/${tariffId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchPolygon()
      }
    } catch (error) {
      console.error('Error deleting tariff:', error)
    } finally {
      setDeletingTariff(null)
    }
  }

  const handleEditTariff = (tariff: UtilizationTariff) => {
    setEditingTariff(tariff.id)
    setEditingTariffValue(tariff.tariffRubT.toString())
  }

  const handleSaveTariff = async (tariff: UtilizationTariff) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygonId}/tariffs/${tariff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tariffRubT: parseFloat(editingTariffValue) }),
      })
      if (res.ok) {
        setEditingTariff(null)
        fetchPolygon()
      }
    } catch (error) {
      console.error('Error updating tariff:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEditTariff = () => {
    setEditingTariff(null)
  }

  const startEditing = (field: string, currentValue: string | null) => {
    setEditing(prev => ({ ...prev, [field]: true }))
    setEditValues(prev => ({ ...prev, [field]: currentValue || '' }))
  }

  const cancelEditing = (field: string) => {
    setEditing(prev => ({ ...prev, [field]: false }))
  }

  const handleValueChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  // Фильтрация тарифов на клиенте
  const filteredTariffs = polygon?.utilizationTariffs.filter(tariff => {
    if (!tariffFilter) return true
    const filter = tariffFilter.toLowerCase()
    return (
      tariff.fkkoCode.toLowerCase().includes(filter) ||
      tariff.itemName?.toLowerCase().includes(filter)
    )
  })

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-4 text-gray-500">Загрузка...</p>
      </div>
    )
  }

  if (!polygon) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Полигон не найден</p>
        <Link href="/admin/calculator/polygons" className="mt-4 inline-block text-primary-600 hover:text-primary-900">
          ← Вернуться к списку
        </Link>
      </div>
    )
  }

  const editableFields = [
    { key: 'receiverName', label: 'Название' },
    { key: 'facilityAddress', label: 'Адрес' },
    { key: 'facilityCoordinates', label: 'Координаты' },
    { key: 'region', label: 'Регион' },
    { key: 'phone', label: 'Телефон', type: 'tel' as const },
    { key: 'email', label: 'Email', type: 'email' as const },
    { key: 'kipNumber', label: 'Номер КИО' },
  ]

  const canAddTariff = selectedCargo && tariffValue && !addingTariff

  return (
    <div>
      {/* Шапка */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/admin/calculator/polygons"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Назад к списку
            </Link>
            <h1 className="mt-3 text-xl font-bold text-gray-900">{polygon.receiverName}</h1>
            <p className="mt-1 text-sm text-gray-500">ID: {polygon.polygonId}</p>
          </div>
          <div className="flex items-center space-x-2 rounded-full bg-green-50 px-3 py-1">
            <span className={clsx(
              'inline-block h-2 w-2 rounded-full',
              polygon.isActive ? 'bg-green-500' : 'bg-gray-400'
            )} />
            <span className={clsx(
              'text-sm font-medium',
              polygon.isActive ? 'text-green-700' : 'text-gray-600'
            )}>
              {polygon.isActive ? 'Активен' : 'Неактивен'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Левая колонка: Данные полигона */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Данные полигона</h2>

            <div className="space-y-4">
              {editableFields.map(({ key, label, type }) => (
                <EditableField
                  key={key}
                  label={label}
                  value={(polygon as any)[key]}
                  field={key}
                  editing={editing}
                  editValues={editValues}
                  onEdit={startEditing}
                  onSave={handleUpdateField}
                  onCancel={cancelEditing}
                  onValueChange={handleValueChange}
                  saving={saving}
                  type={type}
                />
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-500">Статус</label>
                <div className="mt-1">
                  <button
                    onClick={() => handleUpdateField('isActive', !polygon.isActive)}
                    disabled={saving}
                    className={clsx(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                      saving ? 'opacity-50' : '',
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
                </div>
              </div>

              {/* Статистика */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-700">Статистика</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Тарифов:</span>
                    <span className="font-medium text-gray-900">{polygon._count.utilizationTariffs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Расчётов:</span>
                    <span className="font-medium text-gray-900">{polygon._count.calculations}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка: Тарифы утилизации */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Тарифы утилизации</h2>

            {/* Поиск и добавление */}
            <div className="mb-4" ref={dropdownRef}>
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <label className="block text-xs font-medium text-gray-500">Поиск ФККО</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setSelectedCargo(null)
                      }}
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                      placeholder="Поиск по коду ФККО или названию..."
                      className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Dropdown с результатами */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {searchResults.map((item) => (
                        <button
                          key={item.fkkoCode}
                          onClick={() => handleSelectCargo(item)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{item.fkkoCode}</div>
                          <div className="mt-1 truncate text-sm text-gray-600">{item.itemName}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            Класс опасности: {item.hazardClass || '—'} · {item.categoryCode}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500">₽/т</label>
                  <input
                    type="number"
                    value={tariffValue}
                    onChange={(e) => setTariffValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canAddTariff && handleAddTariff()}
                    disabled={!selectedCargo}
                    placeholder="0"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                <button
                  onClick={handleAddTariff}
                  disabled={!canAddTariff}
                  className={clsx(
                    'mt-1 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
                    canAddTariff
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'cursor-not-allowed bg-gray-300'
                  )}
                >
                  {addingTariff ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-1 h-4 w-4" />
                  )}
                  Добавить
                </button>
              </div>
            </div>

            {/* Фильтр тарифов */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tariffFilter}
                  onChange={(e) => setTariffFilter(e.target.value)}
                  placeholder="🔍 Фильтр по коду или названию"
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Таблица */}
            <div className="overflow-hidden rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Код ФККО
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Наименование груза
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Кл.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ₽/т
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(!filteredTariffs || filteredTariffs.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        {tariffFilter ? 'Тарифы не найдены' : 'Тарифов пока нет'}
                      </td>
                    </tr>
                  ) : (
                    filteredTariffs.map((tariff) => (
                      <tr key={tariff.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono font-medium text-gray-900">{tariff.fkkoCode}</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <span 
                            className="text-sm text-gray-900 truncate block"
                            title={tariff.itemName || '-'}
                          >
                            {tariff.itemName || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={clsx(
                            'inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium',
                            tariff.hazardClass === 1 ? 'bg-red-100 text-red-800' :
                            tariff.hazardClass === 2 ? 'bg-orange-100 text-orange-800' :
                            tariff.hazardClass === 3 ? 'bg-yellow-100 text-yellow-800' :
                            tariff.hazardClass === 4 ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          )}>
                            {tariff.hazardClass || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {editingTariff === tariff.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={editingTariffValue}
                                onChange={(e) => setEditingTariffValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTariff(tariff)
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditTariff()
                                  }
                                }}
                                className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-900">
                              {new Intl.NumberFormat('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                maximumFractionDigits: 0,
                              }).format(tariff.tariffRubT)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingTariff === tariff.id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleSaveTariff(tariff)}
                                disabled={saving}
                                className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                              >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={handleCancelEditTariff}
                                className="rounded p-1 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditTariff(tariff)}
                                disabled={deletingTariff === tariff.id || addingTariff}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTariff(tariff.id, tariff.fkkoCode)}
                                disabled={deletingTariff === tariff.id || addingTariff}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {deletingTariff === tariff.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
