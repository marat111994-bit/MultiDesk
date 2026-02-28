"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Image as ImageIcon, Trash2, Edit2, FolderOpen } from "lucide-react"
import { MediaPickerModal } from "./MediaPickerModal"

interface MediaFile {
  id: string
  filename: string
  url: string
  thumbnailUrl: string | null
  mediumUrl: string | null
  mimetype: string
  size: number
  width: number | null
  height: number | null
  alt: string | null
  folder: string
  createdAt: string
}

interface ImagePickerProps {
  value?: string | null
  onChange: (url: string, alt: string) => void
  alt?: string | null
  onAltChange?: (value: string) => void
  label?: string
  folder?: string
  aspectRatio?: string
}

export function ImagePicker({
  value,
  onChange,
  alt,
  onAltChange,
  label = "Изображение",
  folder = "general",
  aspectRatio,
}: ImagePickerProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [previewLoaded, setPreviewLoaded] = useState(false)

  // Вычисляем aspect ratio для превью
  const aspectStyle = aspectRatio ? { aspectRatio: aspectRatio.replace("/", "/") } : {}

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      if (alt) formData.append("alt", alt)

      // Имитация прогресса
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Ошибка загрузки")
      }

      const data = await response.json()
      onChange(data.url, data.alt || "")
      
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Ошибка загрузки")
      setUploading(false)
      setUploadProgress(0)
    }
  }, [folder, alt, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
  })

  const handleRemove = () => {
    onChange("", "")
    setError(null)
  }

  const handleSelectFromLibrary = (url: string, fileAlt: string) => {
    onChange(url, fileAlt)
    setIsLibraryOpen(false)
  }

  // Форматирование размера файла
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        // Изображение выбрано
        <div className="space-y-3">
          <div className="relative inline-block w-full max-w-lg">
            <div 
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
              style={aspectStyle}
            >
              {!previewLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                </div>
              )}
              <img
                src={value}
                alt={alt || "Preview"}
                className={`h-full w-full object-cover transition-opacity ${
                  previewLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setPreviewLoaded(true)}
              />
              
              {/* Кнопки действий */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="rounded bg-white/90 p-1.5 text-gray-700 shadow hover:bg-white"
                  title="Выбрать из библиотеки"
                >
                  <FolderOpen className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded bg-red-500/90 p-1.5 text-white shadow hover:bg-red-600"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Информация о файле */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{value.split("/").pop()}</span>
          </div>

          {/* Поле Alt */}
          {onAltChange && (
            <div>
              <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
                ALT текст
              </label>
              <input
                type="text"
                id="alt"
                value={alt || ""}
                onChange={(e) => onAltChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="Описание изображения для доступности"
              />
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Выбрать из библиотеки
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        // Изображение не выбрано - Dropzone
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
            isDragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
              <p className="text-sm text-gray-600">Загрузка... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <ImageIcon className="mb-3 h-12 w-12 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                {isDragActive ? (
                  "Отпустите файл для загрузки"
                ) : (
                  <>
                    Перетащите файл сюда или{" "}
                    <span className="text-primary-600 hover:text-primary-700">
                      нажмите для выбора
                    </span>
                  </>
                )}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG, WebP, SVG, GIF • до 10 МБ
              </p>
            </>
          )}
        </div>
      )}

      {/* Кнопка "Из библиотеки" когда нет изображения */}
      {!value && !uploading && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <FolderOpen className="h-4 w-4" />
            Из библиотеки
          </button>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Модальное окно библиотеки */}
      {isLibraryOpen && (
        <MediaPickerModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onSelect={handleSelectFromLibrary}
          folder={folder}
        />
      )}
    </div>
  )
}
