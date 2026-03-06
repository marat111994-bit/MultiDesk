"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ImagePicker } from "@/components/admin/ImagePicker"

interface HomePageSettings {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  heroImageAlt: string
  heroBadges: string[]
  whyUsImage: string
  whyUsImageAlt: string
}

export default function AdminHomePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<HomePageSettings>({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    heroImageAlt: "",
    heroBadges: [],
    whyUsImage: "",
    whyUsImageAlt: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/home-page")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/home-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error("Ошибка сохранения")

      alert("Настройки сохранены!")
      router.refresh()
    } catch (error) {
      console.error("Save error:", error)
      alert("Ошибка при сохранении")
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof HomePageSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Главная страница</h1>
        <p className="mt-1 text-sm text-gray-500">
          Настройки главной страницы
        </p>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero секция</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Заголовок *</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Подзаголовок *</label>
              <textarea
                value={settings.heroSubtitle}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <ImagePicker
              value={settings.heroImage}
              onChange={(url, alt) => {
                updateField("heroImage", url)
                updateField("heroImageAlt", alt)
              }}
              alt={settings.heroImageAlt}
              onAltChange={(value) => updateField("heroImageAlt", value)}
              label="Hero изображение"
              folder="hero"
              aspectRatio="16/9"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Бейджи</label>
              <input
                type="text"
                value={settings.heroBadges.join(", ")}
                onChange={(e) =>
                  updateField("heroBadges", e.target.value.split(",").map((b) => b.trim()).filter(Boolean))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="Лицензия 1–5 класс, от 350 ₽/м³"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.heroBadges.map((badge, i) => (
                  <span key={i} className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700">
                    {badge}
                    <button
                      type="button"
                      onClick={() => updateField("heroBadges", settings.heroBadges.filter((_, j) => j !== i))}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Why Us Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Секция "Почему выбирают нас"</h2>

          <div className="space-y-4">
            <ImagePicker
              value={settings.whyUsImage}
              onChange={(url, alt) => {
                updateField("whyUsImage", url)
                updateField("whyUsImageAlt", alt)
              }}
              alt={settings.whyUsImageAlt}
              onAltChange={(value) => updateField("whyUsImageAlt", value)}
              label="Изображение"
              folder="why-us"
              aspectRatio="4/3"
            />
          </div>
        </div>
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
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </form>
  )
}
