'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
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
}

interface PolygonParams {
  polygonId: string
}

export default function AdminCalculatorPolygonDetailPage({ params }: { params: Promise<PolygonParams> }) {
  const { polygonId } = use(params)
  const [polygon, setPolygon] = useState<Polygon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  // Тарифы
  const [newTariff, setNewTariff] = useState({ fkkoCode: '', tariffRubT: '' })
  const [addingTariff, setAddingTariff] = useState(false)
  const [deletingTariff, setDeletingTariff] = useState<string | null>(null)

  useEffect(() => {
    fetchPolygon()
  }, [polygonId])

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

  const handleAddTariff = async () => {
    if (!newTariff.fkkoCode || !newTariff.tariffRubT) return
    setAddingTariff(true)
    try {
      const res = await fetch(`/api/admin/calculator/polygons/${polygonId}/tariffs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fkkoCode: newTariff.fkkoCode,
          tariffRubT: parseFloat(newTariff.tariffRubT),
        }),
      })
      if (res.ok) {
        setNewTariff({ fkkoCode: '', tariffRubT: '' })
        fetchPolygon()
      }
    } catch (error) {
      console.error('Error adding tariff:', error)
    } finally {
      setAddingTariff(false)
    }
  }

  const handleDeleteTariff = async (tariffId: string) => {
    if (!confirm('Удалить тариф?')) return
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

  const startEditing = (field: string, currentValue: string | null) => {
    setEditing(prev => ({ ...prev, [field]: true }))
    setEditValues(prev => ({ ...prev, [field]: currentValue || '' }))
  }

  const cancelEditing = (field: string) => {
    setEditing(prev => ({ ...prev, [field]: false }))
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Загрузка...</p>
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
    { key: 'phone', label: 'Телефон' },
    { key: 'email', label: 'Email' },
    { key: 'kipNumber', label: 'Номер КИО' },
    { key: 'fkkoCodes', label: 'Коды ФККО' },
  ] as const

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/calculator/polygons"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Назад к списку
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{polygon.receiverName}</h1>
        <p className="mt-1 text-sm text-gray-500">ID: {polygon.polygonId}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Карточка полигона */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Данные полигона</h2>

            <div className="space-y-4">
              {editableFields.map(({ key, label }) => {
                const isEditing = editing[key]
                const value = (polygon as any)[key] || '—'

                return (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500">{label}</label>
                    {isEditing ? (
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValues[key] || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={() => handleUpdateField(key, editValues[key])}
                          disabled={saving}
                          className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => cancelEditing(key)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-start justify-between">
                        <p className="text-sm text-gray-900">{value}</p>
                        <button
                          onClick={() => startEditing(key, (polygon as any)[key])}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

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

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Тарифов:</span>
                  <span className="font-medium text-gray-900">{polygon._count.utilizationTariffs}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Расчётов:</span>
                  <span className="font-medium text-gray-900">{polygon._count.calculations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица тарифов */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Тарифы утилизации</h2>

            {/* Форма добавления */}
            <div className="mb-4 flex items-end space-x-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500">Код ФККО</label>
                <input
                  type="text"
                  value={newTariff.fkkoCode}
                  onChange={(e) => setNewTariff(prev => ({ ...prev, fkkoCode: e.target.value }))}
                  placeholder="81112311394"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500">Тариф (₽/т)</label>
                <input
                  type="number"
                  value={newTariff.tariffRubT}
                  onChange={(e) => setNewTariff(prev => ({ ...prev, tariffRubT: e.target.value }))}
                  placeholder="0"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleAddTariff}
                disabled={addingTariff || !newTariff.fkkoCode || !newTariff.tariffRubT}
                className="mt-1 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="mr-1 h-4 w-4" />
                Добавить
              </button>
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
                      Тариф (₽/т)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {polygon.utilizationTariffs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                        Тарифов пока нет
                      </td>
                    </tr>
                  ) : (
                    polygon.utilizationTariffs.map((tariff) => (
                      <tr key={tariff.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{tariff.fkkoCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">
                            {new Intl.NumberFormat('ru-RU', {
                              style: 'currency',
                              currency: 'RUB',
                              maximumFractionDigits: 0,
                            }).format(tariff.tariffRubT)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteTariff(tariff.fkkoCode)}
                            disabled={deletingTariff === tariff.fkkoCode}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <Trash2 className="inline h-4 w-4" />
                          </button>
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
