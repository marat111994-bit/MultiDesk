"use client"

import { useState } from "react"

interface SeoFieldsProps {
  seoTitle?: string
  seoDescription?: string
  seoH1?: string
  seoKeywords?: string[]
  ogImage?: string
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoH1Change: (value: string) => void
  onSeoKeywordsChange: (value: string[]) => void
  onOgImageChange: (value: string) => void
}

export function SeoFields({
  seoTitle = "",
  seoDescription = "",
  seoH1 = "",
  seoKeywords = [],
  ogImage,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoH1Change,
  onSeoKeywordsChange,
  onOgImageChange,
}: SeoFieldsProps) {
  const titleLength = seoTitle.length
  const descriptionLength = seoDescription.length

  return (
    <div className="space-y-6">
      {/* SEO Title */}
      <div>
        <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
          SEO Title
        </label>
        <input
          type="text"
          id="seoTitle"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-primary-500 ${
            titleLength > 60
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-primary-500"
          }`}
          placeholder="Заголовок для поисковиков"
        />
        <p
          className={`mt-1 text-xs ${
            titleLength > 60 ? "text-red-600" : "text-gray-500"
          }`}
        >
          {titleLength} / 60 символов
        </p>
      </div>

      {/* SEO Description */}
      <div>
        <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
          SEO Description
        </label>
        <textarea
          id="seoDescription"
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          rows={3}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-primary-500 ${
            descriptionLength > 160
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-primary-500"
          }`}
          placeholder="Описание для поисковиков"
        />
        <p
          className={`mt-1 text-xs ${
            descriptionLength > 160 ? "text-red-600" : "text-gray-500"
          }`}
        >
          {descriptionLength} / 160 символов
        </p>
      </div>

      {/* SEO H1 */}
      <div>
        <label htmlFor="seoH1" className="block text-sm font-medium text-gray-700">
          SEO H1
        </label>
        <input
          type="text"
          id="seoH1"
          value={seoH1}
          onChange={(e) => onSeoH1Change(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          placeholder="Заголовок H1 на странице"
        />
      </div>

      {/* SEO Keywords */}
      <div>
        <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
          SEO Keywords
        </label>
        <input
          type="text"
          id="seoKeywords"
          value={seoKeywords.join(", ")}
          onChange={(e) =>
            onSeoKeywordsChange(
              e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
            )
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          placeholder="Ключевые слова через запятую"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {seoKeywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
            >
              {keyword}
              <button
                type="button"
                onClick={() => {
                  const newKeywords = seoKeywords.filter((_, i) => i !== index)
                  onSeoKeywordsChange(newKeywords)
                }}
                className="ml-1 text-primary-500 hover:text-primary-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* OG Image */}
      <div>
        <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700">
          OG Image (для соцсетей)
        </label>
        <input
          type="text"
          id="ogImage"
          value={ogImage || ""}
          onChange={(e) => onOgImageChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          placeholder="/images/og-image.jpg"
        />
        {ogImage && (
          <img
            src={ogImage}
            alt="OG Preview"
            className="mt-2 max-h-40 rounded-lg object-cover"
          />
        )}
      </div>

      {/* Google Preview */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-gray-700">
          Превью в Google
        </h4>
        <div className="rounded bg-white p-3">
          <p className="truncate text-xl font-medium text-blue-700 hover:underline">
            {seoTitle || "Название страницы — DanMax"}
          </p>
          <p className="truncate text-sm text-green-700">
            https://danmax.moscow/uslugi/slug-stranicy/
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {seoDescription || "Описание страницы появится здесь..."}
          </p>
        </div>
      </div>
    </div>
  )
}
