'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Upload, Download, Pencil, Trash2, Search, X, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface CargoItem {
  id: string
  itemCode: string
  categoryCode: string
  itemName: string
  fkkoCode: string | null
  hazardClass: number | null
}

interface ApiResponse {
  items: CargoItem[]
  total: number
  page: number
  pages: number
}

interface CategoryOption {
  value: string
  label: string
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: '', label: 'Все категории' },
  { value: 'OSSG', label: 'OSSG — Отходы по ОССиГ' },
  { value: 'NO_OSSG', label: 'NO_OSSG — Отходы без ОССиГ' },
  { value: 'INERT', label: 'INERT — Инертные материалы' },
  { value: 'SNOW', label: 'SNOW — Снег' },
]

const HAZARD_CLASS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
]

function FkkoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<ApiResponse>({ items: [], total: 0, page: 1, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Фильтры
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [hazardClass, setHazardClass] = useState(searchParams.get('hazardClass') || '')
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '50', 10))

  // Модальные окна
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CargoItem | null>(null)
  const [formData, setFormData] = useState({
    itemCode: '',
    categoryCode: 'OSSG',
    itemName: '',
    fkkoCode: '',
    hazardClass: '',
  })

  // Confirm удаления
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: CargoItem | null }>({
    isOpen: false,
    item: null,
  })

  // Импорт
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'add' | 'upsert' | 'replace'>('add')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; updated: number; errors: number } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (hazardClass) params.set('hazardClass', hazardClass)
      params.set('page', searchParams.get('page') || '1')
      params.set('limit', limit.toString())

      const res = await fetch(`/api/admin/calculator/fkko?${params}`)
      if (res.ok) {
        const result: ApiResponse = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching FKCO:', error)
    } finally {
      setLoading(false)
    }
  }, [search, category, hazardClass, limit, searchParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Обновление URL при изменении фильтров
  const updateFilters = useCallback(
    (newFilters: { search?: string; category?: string; hazardClass?: string; page?: string; limit?: string }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newFilters.search !== undefined) {
        if (newFilters.search) params.set('search', newFilters.search)
        else params.delete('search')
      }
      if (newFilters.category !== undefined) {
        if (newFilters.category) params.set('category', newFilters.category)
        else params.delete('category')
      }
      if (newFilters.hazardClass !== undefined) {
        if (newFilters.hazardClass) params.set('hazardClass', newFilters.hazardClass)
        else params.delete('hazardClass')
      }
      if (newFilters.limit !== undefined) {
        params.set('limit', newFilters.limit)
      }
      if (newFilters.page !== undefined) {
        params.set('page', newFilters.page)
      } else {
        params.set('page', '1')
      }
      router.push(`/admin/calculator/fkko?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value)
    updateFilters({ category: e.target.value })
  }

  const handleHazardClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHazardClass(e.target.value)
    updateFilters({ hazardClass: e.target.value })
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10)
    setLimit(newLimit)
    updateFilters({ limit: newLimit.toString(), page: '1' })
  }

  // CRUD операции
  const handleAddNew = () => {
    setEditingItem(null)
    setFormData({
      itemCode: '',
      categoryCode: 'OSSG',
      itemName: '',
      fkkoCode: '',
      hazardClass: '',
    })
    setIsEditModalOpen(true)
  }

  const handleEdit = (item: CargoItem) => {
    setEditingItem(item)
    setFormData({
      itemCode: item.itemCode,
      categoryCode: item.categoryCode,
      itemName: item.itemName,
      fkkoCode: item.fkkoCode || '',
      hazardClass: item.hazardClass?.toString() || '',
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (item: CargoItem) => {
    setDeleteConfirm({ isOpen: true, item })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.item) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/calculator/fkko/${deleteConfirm.item.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const result = await res.json()
        if (result.warning) {
          alert(`Предупреждение: ${result.warning}`)
        }
        setData((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== deleteConfirm.item!.id),
          total: prev.total - 1,
        }))
        setDeleteConfirm({ isOpen: false, item: null })
      }
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        itemCode: formData.itemCode.trim(),
        categoryCode: formData.categoryCode,
        itemName: formData.itemName.trim(),
        fkkoCode: formData.fkkoCode.trim() || null,
        hazardClass: formData.hazardClass ? parseInt(formData.hazardClass, 10) : null,
      }

      const url = editingItem
        ? `/api/admin/calculator/fkko/${editingItem.id}`
        : '/api/admin/calculator/fkko'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const result = await res.json()
        if (editingItem) {
          setData((prev) => ({
            ...prev,
            items: prev.items.map((i) => (i.id === editingItem.id ? result.item : i)),
          }))
        } else {
          setData((prev) => ({
            ...prev,
            items: [result.item, ...prev.items],
            total: prev.total + 1,
          }))
        }
        setIsEditModalOpen(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при сохранении')
      }
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  // Импорт CSV
  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    try {
      const formDataImport = new FormData()
      formDataImport.append('file', importFile)
      formDataImport.append('mode', importMode)

      const res = await fetch('/api/admin/calculator/fkko/import', {
        method: 'POST',
        body: formDataImport,
      })

      if (res.ok) {
        const result = await res.json()
        setImportResult(result)
        setTimeout(() => {
          setIsImportModalOpen(false)
          setImportResult(null)
          setImportFile(null)
          fetchData()
        }, 3000)
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при импорте')
      }
    } catch (error) {
      console.error('Error importing:', error)
    } finally {
      setImporting(false)
    }
  }

  // Экспорт CSV
  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/calculator/fkko/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cargo_items_export.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting:', error)
    }
  }

  // Пагинация
  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  // Helpers для отображения
  const getCategoryBadgeClass = (categoryCode: string) => {
    switch (categoryCode) {
      case 'OSSG':
        return 'bg-blue-100 text-blue-800'
      case 'NO_OSSG':
        return 'bg-orange-100 text-orange-800'
      case 'INERT':
        return 'bg-green-100 text-green-800'
      case 'SNOW':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (categoryCode: string) => {
    return CATEGORY_OPTIONS.find((c) => c.value === categoryCode)?.label || categoryCode
  }

  const getHazardClassBadgeClass = (hazardClass: number | null) => {
    if (hazardClass === null || hazardClass === undefined) return 'bg-gray-100 text-gray-400'
    if (hazardClass <= 2) return 'bg-red-100 text-red-800'
    if (hazardClass <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-200 text-gray-600'
  }

  const truncateName = (name: string, maxLength: number = 80) => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength) + '...'
  }

  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, data.total)

  return (
    <div>
      {/* Шапка */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">База ФККО</h1>
          <p className="mt-1 text-sm text-gray-500">
            Номенклатура грузов — {data.total} записей
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddNew}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить запись
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Upload className="mr-2 h-4 w-4" />
            Импорт CSV
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Поиск</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Код / название"
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Категория</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Класс опасности</label>
            <select
              value={hazardClass}
              onChange={handleHazardClassChange}
              className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {HAZARD_CLASS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Показать</label>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </form>
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Код ФККО
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Наименование
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Категория
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Кл.
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
                  <p className="mt-2">Загрузка...</p>
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Записей не найдено
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {item.fkkoCode || item.itemCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <span
                      className="text-sm text-gray-900 truncate block"
                      title={item.itemName}
                    >
                      {truncateName(item.itemName)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getCategoryBadgeClass(item.categoryCode)
                      )}
                    >
                      {getCategoryLabel(item.categoryCode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={clsx(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        getHazardClassBadgeClass(item.hazardClass)
                      )}
                    >
                      {item.hazardClass || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="text-gray-400 hover:text-red-600"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Пагинация */}
        {!loading && data.items.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <p className="text-sm text-gray-500">
              Показано {startItem}–{endItem} из {data.total}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Назад
              </button>
              {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                let pageNum: number
                if (data.pages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= data.pages - 2) {
                  pageNum = data.pages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={clsx(
                      'rounded-md border px-3 py-1 text-sm',
                      currentPage === pageNum
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pages}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Вперёд
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно редактирования/добавления */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Редактировать запись ФККО' : 'Добавить запись ФККО'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Код ФККО <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fkkoCode}
                  onChange={(e) => setFormData({ ...formData, fkkoCode: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="81110001495"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Внутренний код <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="ITEM_001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Наименование <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="грунт, образовавшийся при проведении землеройных работ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Категория <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryCode}
                  onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {CATEGORY_OPTIONS.filter((c) => c.value).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Класс опасности
                </label>
                <select
                  value={formData.hazardClass}
                  onChange={(e) => setFormData({ ...formData, hazardClass: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">—</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно импорта */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Импорт из CSV</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!importResult ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Ожидаемые колонки:</strong>
                  </p>
                  <code className="mt-1 block text-xs text-gray-500">
                    item_code, category_code, item_name, fkko_code, hazard_class
                  </code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Файл CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Режим импорта
                  </label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'add'}
                        onChange={() => setImportMode('add')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Добавить новые (не трогать существующие)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'upsert'}
                        onChange={() => setImportMode('upsert')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Обновить существующие (upsert)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Заменить всё (удалить и перезаписать)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {importing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Начать импорт
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 p-6 text-center">
                <p className="text-lg font-semibold text-green-900">Импорт завершён</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-green-600">Импортировано</p>
                    <p className="text-2xl font-bold text-green-900">{importResult.imported}</p>
                  </div>
                  <div>
                    <p className="text-green-600">Обновлено</p>
                    <p className="text-2xl font-bold text-green-900">{importResult.updated}</p>
                  </div>
                  <div>
                    <p className="text-green-600">Ошибок</p>
                    <p className="text-2xl font-bold text-green-900">{importResult.errors}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm удаления */}
      {deleteConfirm.isOpen && deleteConfirm.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ isOpen: false, item: null })} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Подтверждение удаления</h2>
            <p className="mt-2 text-sm text-gray-600">
              Удалить запись <strong>{deleteConfirm.item.fkkoCode || deleteConfirm.item.itemCode}</strong>?
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Это может затронуть тарифы полигонов, где используется этот код.
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, item: null })}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={saving}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCalculatorFkkoPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-4 text-gray-500">Загрузка...</p>
      </div>
    }>
      <FkkoContent />
    </Suspense>
  )
}
