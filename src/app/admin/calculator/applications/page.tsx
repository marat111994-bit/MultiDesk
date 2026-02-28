'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { X, Download, Send, CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react'
import { clsx } from 'clsx'

interface Application {
  id: string
  calculationId: string
  serviceType: string
  status: string
  companyName: string | null
  totalPrice: number | null
  createdAt: string
  contactName: string | null
  polygonId: string | null
  cargoName: string | null
}

interface ApplicationDetails extends Application {
  calculationData: any | null
  pdfData: any | null
  polygon: any | null
  comment?: string
  distanceKm: number | null
}

interface Comment {
  id: string
  authorType: string
  authorName: string | null
  comment: string
  createdAt: string
}

const SERVICE_TYPES = {
  transport: 'Перевозка',
  transport_disposal_auto: 'Перевозка + утилизация (авто)',
  transport_disposal_manual: 'Перевозка + утилизация (ручной)',
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Черновик', icon: FileText },
  sent: { color: 'bg-blue-100 text-blue-800', label: 'Отправлено', icon: Send },
  completed: { color: 'bg-green-100 text-green-800', label: 'Завершено', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Отменено', icon: XCircle },
}

const formatPrice = (price: number | null) => {
  if (price === null) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function AdminCalculatorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  // Фильтры
  const [search, setSearch] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Модальное окно
  const [selectedApp, setSelectedApp] = useState<ApplicationDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { search }),
        ...(serviceType && { serviceType }),
        ...(status && { status }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })

      const res = await fetch(`/api/admin/calculator/applications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.data)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }, [offset, limit, search, serviceType, status, dateFrom, dateTo])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const fetchApplicationDetails = async (id: string) => {
    setDetailsLoading(true)
    try {
      const res = await fetch(`/api/admin/calculator/applications/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedApp(data)
        fetchComments(id)
      }
    } catch (error) {
      console.error('Error fetching application details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const fetchComments = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/calculator/applications/${id}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApp) return
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/admin/calculator/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setSelectedApp({ ...selectedApp, status: newStatus })
        setApplications(applications.map(app =>
          app.id === selectedApp.id ? { ...app, status: newStatus } : app
        ))
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleAddComment = async () => {
    if (!selectedApp || !newComment.trim()) return
    try {
      const res = await fetch(`/api/admin/calculator/applications/${selectedApp.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          authorType: 'dispatcher',
        }),
      })
      if (res.ok) {
        setNewComment('')
        fetchComments(selectedApp.id)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDownloadPdf = () => {
    // TODO: Реализовать скачивание PDF
    alert('Функция скачивания PDF будет реализована')
  }

  const handleFilterReset = () => {
    setSearch('')
    setServiceType('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
    setOffset(0)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Заявки на расчёт</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление заявками из калькулятора
        </p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Поиск</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Компания, ID, груз..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Тип услуги</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Все</option>
              {Object.entries(SERVICE_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Все</option>
              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
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
            onClick={fetchApplications}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
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
                ID заявки
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Компания
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Тип услуги
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Дата
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
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Заявок не найдено
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft
                return (
                  <tr
                    key={app.id}
                    onClick={() => fetchApplicationDetails(app.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {app.calculationId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {app.companyName || app.contactName || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {SERVICE_TYPES[app.serviceType as keyof typeof SERVICE_TYPES] || app.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(app.totalPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig.color)}>
                        <statusConfig.icon className="mr-1 h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {format(new Date(app.createdAt), 'dd MMM yyyy', { locale: ru })}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Пагинация */}
        {!loading && applications.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="text-sm text-gray-500">
              Показано {offset + 1}–{Math.min(offset + applications.length, total)} из {total}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Назад
              </button>
              <button
                onClick={() => setOffset(Math.min(total - limit, offset + limit))}
                disabled={offset + applications.length >= total}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Вперёд
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedApp(null)} />

            <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl">
              {/* Заголовок */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Заявка №{selectedApp.calculationId}
                </h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Контент */}
              {detailsLoading ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  Загрузка...
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Компания</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.companyName || '—'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">ИНН</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.calculationData?.companyInn || '—'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Контактное лицо</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.contactName || '—'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Телефон</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.calculationData?.contactPhone || '—'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.calculationData?.contactEmail || '—'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Тип услуги</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {SERVICE_TYPES[selectedApp.serviceType as keyof typeof SERVICE_TYPES] || selectedApp.serviceType}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Груз</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.cargoName || '—'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Объём</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApp.calculationData?.volume ? `${selectedApp.calculationData.volume} ${selectedApp.calculationData.unit || 'м³'}` : '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Адрес погрузки</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.calculationData?.pickupAddress || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Адрес разгрузки</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedApp.calculationData?.dropoffAddress || '—'}</p>
                    </div>
                    {selectedApp.polygon && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Полигон</h3>
                        <p className="mt-1 text-sm text-gray-900">{selectedApp.polygon.receiverName}</p>
                        <p className="text-xs text-gray-500">{selectedApp.polygon.facilityAddress}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Расстояние</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApp.distanceKm ? `${selectedApp.distanceKm} км` : '—'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Итого</h3>
                      <p className="mt-1 text-lg font-bold text-gray-900">{formatPrice(selectedApp.totalPrice)}</p>
                    </div>
                  </div>

                  {/* Комментарии */}
                  <div className="mt-6 border-t pt-4">
                    <h3 className="mb-3 flex items-center text-sm font-medium text-gray-900">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      История комментариев
                    </h3>
                    <div className="mb-4 space-y-2">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-500">Комментариев пока нет</p>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={clsx(
                              'rounded-lg p-3 text-sm',
                              comment.authorType === 'dispatcher' ? 'bg-blue-50' : 'bg-gray-50'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {comment.authorName || (comment.authorType === 'dispatcher' ? 'Диспетчер' : 'Клиент')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(comment.createdAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-700">{comment.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Добавить комментарий..."
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <button
                        onClick={handleAddComment}
                        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Футер с действиями */}
              <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedApp.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={statusUpdating}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Скачать КП (PDF)
                  </button>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
