"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"

interface FkkoItem {
  id?: string
  code: string
  name: string
  hazardClass: number
  description?: string
  order: number
}

interface FkkoEditorProps {
  items: FkkoItem[]
  onChange: (items: FkkoItem[]) => void
}

const HAZARD_CLASSES = [
  { value: 1, label: "I класс", color: "bg-red-100 text-red-800" },
  { value: 2, label: "II класс", color: "bg-orange-100 text-orange-800" },
  { value: 3, label: "III класс", color: "bg-yellow-100 text-yellow-800" },
  { value: 4, label: "IV класс", color: "bg-blue-100 text-blue-800" },
  { value: 5, label: "V класс", color: "bg-green-100 text-green-800" },
]

export function FkkoEditor({ items, onChange }: FkkoEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: undefined, code: "", name: "", hazardClass: 5, description: "", order: items.length },
    ])
  }

  const updateItem = (index: number, field: keyof FkkoItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange(newItems)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium text-gray-900">ФККО</h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-1 h-4 w-4" /> Добавить код
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Код</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Наименование</th>
              <th className="w-32 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Класс</th>
              <th className="w-12 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="px-3 py-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.code}
                    onChange={(e) => updateItem(index, "code", e.target.value)}
                    className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="81110000000"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Наименование отхода"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.hazardClass}
                    onChange={(e) => updateItem(index, "hazardClass", parseInt(e.target.value))}
                    className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {HAZARD_CLASSES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Легенда классов */}
      <div className="flex flex-wrap gap-2">
        {HAZARD_CLASSES.map((c) => (
          <span key={c.value} className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${c.color}`}>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
