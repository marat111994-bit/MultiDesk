"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"
import { Plus, FileText, Briefcase, Image } from "lucide-react"

interface Stats {
  services: { total: number; active: number }
  subcategories: { total: number; active: number }
  blog: { total: number; published: number; drafts: number }
  cases: { total: number; active: number }
  submissions: { total: number; new: number }
  orders: { today: number; monthlyRevenue: number }
}

interface Submission {
  id: string
  name: string
  phone: string
  serviceType: string | null
  isRead: boolean
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, submissionsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/submissions"),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (submissionsRes.ok) {
          const data = await submissionsRes.json()
          const submissionsData = Array.isArray(data) ? data : data.submissions || []
          setSubmissions(submissionsData.slice(0, 10))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="mt-1 text-sm text-gray-500">
          Сводка по сайту и последним заявкам
        </p>
      </div>

      {/* Верхний ряд — статистика */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {/* Услуги */}
        <div className="rounded-lg bg-white p-6 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Услуги</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.services.total || 0}
          </dd>
          <p className="mt-1 text-sm text-gray-600">
            <span className="text-green-600">{stats?.services.active || 0}</span> активных
          </p>
        </div>

        {/* Подкатегории */}
        <div className="rounded-lg bg-white p-6 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Подкатегории</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.subcategories.total || 0}
          </dd>
          <p className="mt-1 text-sm text-gray-600">
            <span className="text-green-600">{stats?.subcategories.active || 0}</span> активных
          </p>
        </div>

        {/* Статьи */}
        <div className="rounded-lg bg-white p-6 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Статьи</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.blog.published || 0}
          </dd>
          <p className="mt-1 text-sm text-gray-600">
            <span className="text-yellow-600">{stats?.blog.drafts || 0}</span> черновиков
          </p>
        </div>

        {/* Заявки сегодня */}
        <div className="rounded-lg bg-white p-6 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Заявки сегодня</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.orders.today || 0}
          </dd>
          <p className="mt-1 text-sm text-gray-600">
            Суммарно из всех источников
          </p>
        </div>

        {/* Сумма расчётов */}
        <div className="rounded-lg bg-white p-6 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Сумма расчётов</dt>
          <dd className="mt-2 text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              maximumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'short',
            }).format(stats?.orders.monthlyRevenue || 0)}
          </dd>
          <p className="mt-1 text-sm text-gray-600">
            За текущий месяц (завершено)
          </p>
        </div>
      </div>

      {/* Средний ряд */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Левая часть — Последние заявки (2/3) */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Последние 10 заявок</h2>
              <Link
                href="/admin/submissions"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Смотреть все →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Имя
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Телефон
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Услуга
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        Заявок пока нет
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          !submission.isRead ? "font-medium" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {format(new Date(submission.createdAt), "dd.MM.yyyy HH:mm", {
                            locale: ru,
                          })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {!submission.isRead && (
                            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                          )}
                          {submission.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {submission.phone}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {submission.serviceType || "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              submission.isRead
                                ? "bg-gray-100 text-gray-800"
                                : "bg-primary-100 text-primary-800"
                            }`}
                          >
                            {submission.isRead ? "Прочитано" : "Новое"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Правая часть — Быстрые действия (1/3) */}
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-sm font-medium text-gray-900">Быстрые действия</h3>
            <div className="space-y-3">
              <Link
                href="/admin/services/new"
                className="flex items-center rounded-md bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
              >
                <Plus className="mr-3 h-5 w-5 shrink-0" />
                Добавить услугу
              </Link>
              <Link
                href="/admin/blog/new"
                className="flex items-center rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
              >
                <FileText className="mr-3 h-5 w-5 shrink-0" />
                Написать статью
              </Link>
              <Link
                href="/admin/cases/new"
                className="flex items-center rounded-md bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
              >
                <Briefcase className="mr-3 h-5 w-5 shrink-0" />
                Добавить кейс
              </Link>
              <Link
                href="/admin/media"
                className="flex items-center rounded-md bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
              >
                <Image className="mr-3 h-5 w-5 shrink-0" />
                Загрузить изображение
              </Link>
            </div>
          </div>

          {/* Черновики статей */}
          {stats && stats.blog.drafts > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-sm font-medium text-gray-900">Черновики</h3>
              <p className="text-sm text-gray-500">
                {stats.blog.drafts} черновиков ожидает публикации
              </p>
              <Link
                href="/admin/blog"
                className="mt-3 block text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Перейти к черновикам →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
