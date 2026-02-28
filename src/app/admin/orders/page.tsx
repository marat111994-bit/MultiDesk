'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { clsx } from 'clsx'
import {
  FileText,
  Calculator,
  Search,
  Filter,
  Download,
  Eye,
  Archive,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react'

interface UnifiedOrder {
  id: string
  source: 'site' | 'calculator'
  date: string
  contactName: string
  companyName: string | null
  type: string
  totalPrice: number | null
  status: string
  rawId: string
  // Дополнительные поля для отображения
  phone?: string
  comment?: string
  calculationId?: string
  cargoName?: string
  sourceName?: string
}

interface Pagination {
  total: number
  siteTotal: number
  calculatorTotal: number
  limit: number
  offset: number
  hasMore: boolean
}

const SOURCE_ICONS: Record<'site' | 'calculator', React.ReactNode> = {
  site: <FileText className="h-4 w-4" />,
  calculator: <Calculator className="h-4 w-4" />,
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon?: React.ReactNode }> = {
  // Статусы для заявок с сайта
  new: { color: 'bg-yellow-100 text-yellow-800', label: 'Новая' },
  read: { color: 'bg-green-100 text-green-800', label: 'Прочитано' },
  archived: { color: 'bg-gray-100 text-gray-800', label: 'Архив' },
  // Статусы для заявок калькулятора
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Черновик', icon: <FileText className="mr-1 h-3 w-3" /> },
  sent: { color: 'bg-blue-100 text-blue-800', label: 'Отправлено', icon: <Send className="mr-1 h-3 w-3" /> },
  completed: { color: 'bg-green-100 text-green-800', label: 'Завершено', icon: <CheckCircle className="mr-1 h-3 w-3" /> },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Отменено', icon: <XCircle className="mr-1 h-3 w-3" /> },
}

const TYPE_FILTERS = [
  { value: 'all', label: 'Все источники' },
  { value: 'site', label: 'Форма сайта 📝' },
  { value: 'calculator', label: 'Калькулятор 🧮' },
]

const STATUS_FILTERS = [
  { value: '', label: 'Все статусы' },
  { value: 'new', label: 'Новые' },
  { value: 'read', label: 'Прочитано' },
  { value: 'draft', label: 'Черновик' },
  { value: 'sent', label: 'Отправлено' },
  { value: 'completed', label: 'Завершено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'archived', label: 'Архив' },
]

const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  // Фильтры
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Пагинация
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        offset: offset.toString(),
        ...(status && { status }),
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })

      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [type, status, search, dateFrom, dateTo, limit, offset])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleFilterReset = () => {
    setType('all')
    setStatus('')
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setOffset(0)
  }

  const totalPages = pagination ? Math.ceil(pagination.total / limit) : 0
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Все заявки</h1>
        <p className="mt-1 text-sm text-gray-500">
          Объединённый список заявок с сайта и из калькулятора
        </p>
      </div>

      {/* Статистика */}
      {pagination && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Всего</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">С сайта</p>
            <p className="text-2xl font-bold text-blue-600">{pagination.siteTotal}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Калькулятор</p>
            <p className="text-2xl font-bold text-purple-600">{pagination.calculatorTotal}</p>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Источник</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setOffset(0)
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {TYPE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Статус</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setOffset(0)
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Поиск</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя, телефон, компания..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">С даты</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">По дату</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleFilterReset}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Сбросить фильтры
          </button>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Filter className="mr-2 h-4 w-4" />
            Применить
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Источник
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Контакт / Компания
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Загрузка...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Заявок не найдено
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft
                return (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => {
                      // Переход к деталям заявки
                      if (order.source === 'site') {
                        window.location.href = `/admin/submissions`
                      } else {
                        // Для калькулятора можно открыть детали
                        console.log('Order details:', order)
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          order.source === 'site'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        )}
                      >
                        {SOURCE_ICONS[order.source]}
                        {order.source === 'site' ? 'Форма' : 'Калькулятор'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {format(new Date(order.date), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.sourceName || order.contactName || '—'}
                        </p>
                        {order.source === 'site' && order.phone && (
                          <a
                            href={`tel:${order.phone}`}
                            className="text-xs text-primary-600 hover:text-primary-900"
                          >
                            {order.phone}
                          </a>
                        )}
                        {order.source === 'calculator' && order.calculationId && (
                          <p className="text-xs text-gray-500">
                            № {order.calculationId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {order.type}
                      </span>
                      {order.cargoName && (
                        <p className="text-xs text-gray-400">{order.cargoName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'text-sm font-medium',
                          order.totalPrice ? 'text-gray-900' : 'text-gray-400'
                        )}
                      >
                        {formatPrice(order.totalPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          statusConfig.color
                        )}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Пагинация */}
        {!loading && orders.length > 0 && pagination && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="text-sm text-gray-500">
              Показано {offset + 1}–{Math.min(offset + orders.length, pagination.total)} из {pagination.total}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Назад
              </button>
              <span className="text-sm text-gray-500">
                Стр. {currentPage} из {totalPages}
              </span>
              <button
                onClick={() => setOffset(Math.min(pagination.total - limit, offset + limit))}
                disabled={offset + orders.length >= pagination.total}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Вперёд
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
