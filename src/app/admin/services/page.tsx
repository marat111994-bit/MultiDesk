"use client"

import { useState, useEffect, Fragment as ReactFragment } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, Copy, ChevronRight, ChevronDown } from "lucide-react"
import { clsx } from "clsx"

interface Service {
  id: string
  slug: string
  title: string
  isActive: boolean
  order: number
  _count: { subcategories: number }
  subcategories?: any[]
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const res = await fetch("/api/admin/services")
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      })
      if (res.ok) {
        setServices(services.map(s => s.id === id ? { ...s, isActive: !current } : s))
      }
    } catch (error) {
      console.error("Error toggling active:", error)
    }
  }

  async function duplicate(id: string) {
    try {
      const service = services.find(s => s.id === id)
      if (!service) return

      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          title: `${service.title} (копия)`,
          slug: `${service.slug}-copy`,
        }),
      })
      if (res.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error duplicating:", error)
    }
  }

  async function deleteService(id: string) {
    if (!confirm("Удалить услугу? Это действие нельзя отменить.")) return
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Загрузка...</div>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление услугами и подкатегориями
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить услугу
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Подкатегории
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {services.map((service) => (
              <ReactFragment key={service.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setExpanded(expanded === service.id ? null : service.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expanded === service.id ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-900"
                    >
                      {service.title}
                    </Link>
                    <p className="text-xs text-gray-500">{service.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {service._count.subcategories} подкатегорий
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(service.id, service.isActive)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        service.isActive ? "bg-green-500" : "bg-gray-200"
                      )}
                    >
                      <span
                        className={clsx(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          service.isActive ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="mr-3 text-primary-600 hover:text-primary-900"
                    >
                      <Pencil className="inline h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => duplicate(service.id)}
                      className="mr-3 text-gray-600 hover:text-gray-900"
                    >
                      <Copy className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
                {expanded === service.id && service.subcategories && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="pl-8">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">Подкатегории:</h4>
                        <ul className="space-y-1">
                          {service.subcategories.map((sub) => (
                            <li key={sub.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{sub.title}</span>
                              <span className={clsx(
                                "inline-flex rounded-full px-2 text-xs font-semibold",
                                sub.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              )}>
                                {sub.isActive ? "Активна" : "Неактивна"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </ReactFragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
