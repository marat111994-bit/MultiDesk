"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { clsx } from "clsx"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { ImagePicker } from "@/components/admin/ImagePicker"
import { SeoFields } from "@/components/admin/SeoFields"

interface BlogFormProps {
  initialData?: any
  postId?: string
}

export function BlogForm({ initialData, postId }: BlogFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [readingTimeAuto, setReadingTimeAuto] = useState(true)

  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    coverImageAlt: initialData?.coverImageAlt || "",
    author: initialData?.author || "DanMax",
    readingTime: initialData?.readingTime || 0,
    tags: initialData?.tags ? JSON.parse(initialData.tags) : [],
    isPublished: initialData?.isPublished ?? false,
    publishedAt: initialData?.publishedAt,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    ogImage: initialData?.ogImage || "",
  })

  // Автогенерация slug из title
  useEffect(() => {
    if (!postId && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^а-яa-z0-9\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, postId, formData.slug])

  // Автоподсчёт времени чтения
  useEffect(() => {
    if (readingTimeAuto && formData.content) {
      const words = formData.content.replace(/<[^>]*>/g, "").split(/\s+/).length
      const time = Math.ceil(words / 200)
      setFormData((prev) => ({ ...prev, readingTime: time }))
    }
  }, [formData.content, readingTimeAuto])

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (!postId && formData.title && formData.content) {
        autoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData])

  // Загрузка черновика из localStorage
  useEffect(() => {
    if (!postId) {
      const saved = localStorage.getItem("blog-draft")
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          setFormData((prev) => ({ ...prev, ...draft }))
        } catch (e) {
          console.error("Error loading draft:", e)
        }
      }
    }
  }, [postId])

  const autoSave = useCallback(() => {
    if (!postId && formData.title && formData.content) {
      setAutoSaving(true)
      localStorage.setItem("blog-draft", JSON.stringify(formData))
      setTimeout(() => setAutoSaving(false), 1000)
    }
  }, [formData, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = postId ? `/api/admin/blog/${postId}` : "/api/admin/blog"
      const method = postId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Ошибка сохранения")

      // Очищаем черновик
      if (!postId) {
        localStorage.removeItem("blog-draft")
      }

      router.push("/admin/blog")
      router.refresh()
    } catch (error) {
      console.error("Save error:", error)
      alert("Ошибка при сохранении")
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/blog/${formData.slug}?preview=true`, "_blank")
    } else {
      alert("Сначала укажите slug")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Основная часть */}
        <div className="lg:col-span-2 space-y-6">
          {/* Заголовок */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Заголовок статьи"
              className="w-full border-0 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <div className="mt-1 flex items-center">
              <span className="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                /blog/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Описание (для превью)</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              placeholder="Краткое описание статьи..."
            />
          </div>

          {/* Обложка */}
          <ImagePicker
            value={formData.coverImage}
            onChange={(url, alt) => {
              updateField("coverImage", url)
              if (alt) updateField("coverImageAlt", alt)
            }}
            alt={formData.coverImageAlt}
            onAltChange={(value) => updateField("coverImageAlt", value)}
            label="Обложка статьи"
            folder="blog"
            aspectRatio="16/9"
          />

          {/* Автор и теги */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Автор</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => updateField("author", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Теги</label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  updateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="ФККО, грунт"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => updateField("tags", formData.tags.filter((_: any, j: number) => j !== i))}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Контент */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Контент</label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => updateField("content", value)}
              placeholder="Напишите статью..."
            />
          </div>
        </div>

        {/* Сайдбар */}
        <div className="space-y-6">
          {/* Публикация */}
          <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-medium text-gray-900">Публикация</h3>

            <div className="mb-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.isPublished}
                  onChange={() => updateField("isPublished", false)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Черновик</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.isPublished}
                  onChange={() => updateField("isPublished", true)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Опубликовать</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700">Время чтения</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={formData.readingTime}
                  onChange={(e) => {
                    setReadingTimeAuto(false)
                    updateField("readingTime", parseInt(e.target.value) || 0)
                  }}
                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">мин</span>
                <button
                  type="button"
                  onClick={() => setReadingTimeAuto(true)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Авто
                </button>
              </div>
            </div>

            {autoSaving && (
              <p className="mb-4 text-xs text-green-600">Автосохранение...</p>
            )}

            <div className="space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Превью →
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-medium text-gray-900">SEO</h3>
            <SeoFields
              seoTitle={formData.seoTitle}
              seoDescription={formData.seoDescription}
              seoH1={formData.title}
              seoKeywords={formData.tags}
              ogImage={formData.ogImage}
              onSeoTitleChange={(v) => updateField("seoTitle", v)}
              onSeoDescriptionChange={(v) => updateField("seoDescription", v)}
              onSeoH1Change={() => {}}
              onSeoKeywordsChange={(v) => updateField("tags", v)}
              onOgImageChange={(v) => updateField("ogImage", v)}
            />
          </div>
        </div>
      </div>

      {/* Кнопки внизу */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        {postId && (
          <button
            type="button"
            onClick={async () => {
              if (confirm("Удалить статью?")) {
                await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" })
                router.push("/admin/blog")
              }
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Удалить
          </button>
        )}
      </div>
    </form>
  )
}
