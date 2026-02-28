"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"

interface PricingItem {
  id?: string
  serviceName: string
  unit: string
  price: string
  order: number
}

interface PricingEditorProps {
  items: PricingItem[]
  onChange: (items: PricingItem[]) => void
}

export function PricingEditor({ items, onChange }: PricingEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: undefined, serviceName: "", unit: "м³", price: "", order: items.length },
    ])
  }

  const updateItem = (index: number, field: keyof PricingItem, value: string | number) => {
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
        <h3 className="text-lg font-medium text-gray-900">Цены</h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-1 h-4 w-4" /> Добавить строку
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Услуга</th>
              <th className="w-24 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Ед.</th>
              <th className="w-32 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Цена</th>
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
                    value={item.serviceName}
                    onChange={(e) => updateItem(index, "serviceName", e.target.value)}
                    className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Название услуги"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="м³"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="от 350 ₽"
                  />
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
    </div>
  )
}
