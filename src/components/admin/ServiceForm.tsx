"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { clsx } from "clsx"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { SeoFields } from "@/components/admin/SeoFields"
import { PricingEditor } from "@/components/admin/PricingEditor"
import { FaqEditor } from "@/components/admin/FaqEditor"
import { AdvantagesEditor } from "@/components/admin/AdvantagesEditor"
import { FkkoEditor } from "@/components/admin/FkkoEditor"

const tabs = [
  { id: "main", label: "Основное" },
  { id: "seo", label: "SEO" },
  { id: "pricing", label: "Цены" },
  { id: "faq", label: "FAQ" },
  { id: "advantages", label: "Преимущества" },
  { id: "fkko", label: "ФККО" },
]

interface ServiceFormProps {
  initialData?: any
  serviceId?: string
}

export function ServiceForm({ initialData, serviceId }: ServiceFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("main")
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    title: initialData?.title || "",
    shortTitle: initialData?.shortTitle || "",
    description: initialData?.description || "",
    shortDescription: initialData?.shortDescription || "",
    heroImage: initialData?.heroImage || "",
    heroImageAlt: initialData?.heroImageAlt || "",
    badges: initialData?.badges ? JSON.parse(initialData.badges) : [],
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoH1: initialData?.seoH1 || "",
    seoKeywords: initialData?.seoKeywords ? JSON.parse(initialData.seoKeywords) : [],
    ogImage: initialData?.ogImage || "",
  })

  const [pricing, setPricing] = useState(
    initialData?.pricing?.map((p: any) => ({
      id: p.id,
      serviceName: p.serviceName,
      unit: p.unit,
      price: p.price,
      order: p.order,
    })) || []
  )

  const [faq, setFaq] = useState(
    initialData?.faqItems?.map((f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
    })) || []
  )

  const [advantages, setAdvantages] = useState(
    initialData?.advantages?.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon || "truck",
      order: a.order,
    })) || []
  )

  const [fkko, setFkko] = useState(
    initialData?.fkkoItems?.map((f: any) => ({
      id: f.id,
      code: f.code,
      name: f.name,
      hazardClass: f.hazardClass,
      description: f.description,
      order: f.order,
    })) || []
  )

  // Автогенерация slug из title
  useEffect(() => {
    if (!serviceId && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^а-яa-z0-9\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, serviceId, formData.slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = serviceId
        ? `/api/admin/services/${serviceId}`
        : "/api/admin/services"

      const method = serviceId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Ошибка сохранения")

      // Сохраняем связанные данные (pricing, faq, advantages, fkko)
      // Это упрощённая версия - в полной версии нужно отправлять всё вместе

      router.push("/admin/services")
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

  return (
    <form onSubmit={handleSubmit}>
      {/* Табы */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Контент табов */}
      <div className="space-y-6">
        {activeTab === "main" && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Короткое название</label>
                <input
                  type="text"
                  value={formData.shortTitle}
                  onChange={(e) => updateField("shortTitle", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">URL страницы: /uslugi/{formData.slug || "..."}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Краткое описание</label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Полное описание</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Введите описание услуги..."
              />
            </div>

            <ImageUploader
              value={formData.heroImage}
              onChange={(value) => updateField("heroImage", value)}
              alt={formData.heroImageAlt}
              onAltChange={(value) => updateField("heroImageAlt", value)}
              label="Hero изображение"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Бейджи</label>
              <input
                type="text"
                value={formData.badges.join(", ")}
                onChange={(e) =>
                  updateField("badges", e.target.value.split(",").map((b) => b.trim()).filter(Boolean))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="Лицензия, от 350₽"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.badges.map((badge: string, i: number) => (
                  <span key={i} className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700">
                    {badge}
                    <button
                      type="button"
                      onClick={() => updateField("badges", formData.badges.filter((_: any, j: number) => j !== i))}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Порядок</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => updateField("order", parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => updateField("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Активна</span>
                </label>
              </div>
            </div>
          </>
        )}

        {activeTab === "seo" && (
          <SeoFields
            seoTitle={formData.seoTitle}
            seoDescription={formData.seoDescription}
            seoH1={formData.seoH1}
            seoKeywords={formData.seoKeywords}
            ogImage={formData.ogImage}
            onSeoTitleChange={(v) => updateField("seoTitle", v)}
            onSeoDescriptionChange={(v) => updateField("seoDescription", v)}
            onSeoH1Change={(v) => updateField("seoH1", v)}
            onSeoKeywordsChange={(v) => updateField("seoKeywords", v)}
            onOgImageChange={(v) => updateField("ogImage", v)}
          />
        )}

        {activeTab === "pricing" && (
          <PricingEditor items={pricing} onChange={setPricing} />
        )}

        {activeTab === "faq" && (
          <FaqEditor items={faq} onChange={setFaq} />
        )}

        {activeTab === "advantages" && (
          <AdvantagesEditor items={advantages} onChange={setAdvantages} />
        )}

        {activeTab === "fkko" && (
          <FkkoEditor items={fkko} onChange={setFkko} />
        )}
      </div>

      {/* Кнопки */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <div className="flex gap-3">
          {serviceId && (
            <button
              type="button"
              onClick={async () => {
                if (confirm("Удалить услугу?")) {
                  await fetch(`/api/admin/services/${serviceId}`, { method: "DELETE" })
                  router.push("/admin/services")
                }
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Удалить
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Сохранение..." : serviceId ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </form>
  )
}
