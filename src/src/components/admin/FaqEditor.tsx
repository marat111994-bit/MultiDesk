"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"
import { RichTextEditor } from "./RichTextEditor"

interface FaqItem {
  id?: string
  question: string
  answer: string
  order: number
}

interface FaqEditorProps {
  items: FaqItem[]
  onChange: (items: FaqItem[]) => void
}

export function FaqEditor({ items, onChange }: FaqEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: undefined, question: "", answer: "", order: items.length },
    ])
  }

  const updateItem = (index: number, field: keyof FaqItem, value: string | number) => {
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
        <h3 className="text-lg font-medium text-gray-900">FAQ</h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="mr-1 h-4 w-4" /> Добавить вопрос
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-start gap-2">
              <GripVertical className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(index, "question", e.target.value)}
                className="flex-1 rounded border-gray-300 text-sm font-medium focus:border-primary-500 focus:ring-primary-500"
                placeholder="Вопрос"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <RichTextEditor
              value={item.answer}
              onChange={(value) => updateItem(index, "answer", value)}
              placeholder="Ответ..."
            />
          </div>
        ))}
      </div>
    </div>
  )
}
