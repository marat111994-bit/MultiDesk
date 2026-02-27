"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"

interface AdvantageItem {
  id?: string
  title: string
  description: string
  icon: string
  order: number
}

interface AdvantagesEditorProps {
  items: AdvantageItem[]
  onChange: (items: AdvantageItem[]) => void
}

const ICONS = [
  "shield-check", "truck", "clock", "file-text", "dollar-sign",
  "leaf", "recycle", "hammer", "award", "layers"
]

export function AdvantagesEditor({ items, onChange }: AdvantagesEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: undefined, title: "", description: "", icon: "truck", order: items.length },
    ])
  }

  const updateItem = (index: number, field: keyof AdvantageItem, value: string | number) => {
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
        <h3 className="text-lg font-medium text-gray-900">Преимущества</h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-1 h-4 w-4" /> Добавить
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    className="flex-1 rounded border-gray-300 text-sm font-medium focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Заголовок"
                  />
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(index, "icon", e.target.value)}
                    className="rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  rows={2}
                  className="w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Описание"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
