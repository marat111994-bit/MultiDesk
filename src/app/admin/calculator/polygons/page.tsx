'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Plus } from 'lucide-react'
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

export default function AdminCalculatorPolygonsPage() {
  const [polygons, setPolygons] = useState<Polygon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
    const matchesSearch = search === '' ||
      polygon.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      polygon.facilityAddress.toLowerCase().includes(search.toLowerCase()) ||
      polygon.region?.toLowerCase().includes(search.toLowerCase()) ||
      polygon.polygonId.toLowerCase().includes(search.toLowerCase())

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
      </div>

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
    </div>
  )
}
