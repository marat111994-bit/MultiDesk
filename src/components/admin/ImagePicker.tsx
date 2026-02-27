"use client"

import { useState, useCallback } from "react"
import { clsx } from "clsx"
import { useDropzone } from "react-dropzone"
import { Upload, X, Image as ImageIcon, Search, Loader2 } from "lucide-react"

interface MediaFile {
  id: string
  filename: string
  url: string
  thumbnailUrl?: string
  alt: string | null
}

interface ImagePickerProps {
  value?: string
  onChange: (value: string) => void
  alt?: string
  onAltChange?: (value: string) => void
  label?: string
}

export function ImagePicker({
  value,
  onChange,
  alt,
  onAltChange,
  label = "Изображение",
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/media?${params}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }, [search])

  const handleOpen = () => {
    setIsOpen(true)
    fetchFiles()
  }

  const handleSelect = (file: MediaFile) => {
    onChange(file.url)
    if (onAltChange) onAltChange(file.alt || "")
    setIsOpen(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "general")

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        onChange(data.url)
        fetchFiles()
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Ошибка загрузки")
    } finally {
      setUploading(false)
    }
  }, [onChange, fetchFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".svg"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt={alt || "Preview"}
              className="max-h-64 w-full max-w-lg rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={clsx(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
              isDragActive
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary-600" />
                <p className="text-sm text-gray-600">Загрузка...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-primary-600">
                    Нажмите для загрузки
                  </span>{" "}
                  или перетащите изображение
                </p>
                <button
                  type="button"
                  onClick={handleOpen}
                  className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Выбрать из медиатеки →
                </button>
              </>
            )}
          </div>
        )}

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
              placeholder="Описание изображения"
            />
          </div>
        )}
      </div>

      {/* Модальное окно выбора */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Выбрать изображение
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Поиск и загрузка */}
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div
                {...getRootProps()}
                className={clsx(
                  "flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium",
                  isDragActive
                    ? "bg-primary-100 text-primary-700"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </div>
            </div>

            {/* Сетка изображений */}
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Загрузка...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Нет изображений
              </div>
            ) : (
              <div className="grid max-h-96 grid-cols-3 gap-4 overflow-y-auto md:grid-cols-4 lg:grid-cols-6">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={clsx(
                      "group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100",
                      value === file.url
                        ? "ring-2 ring-primary-500"
                        : "hover:ring-2 hover:ring-primary-300"
                    )}
                    onClick={() => handleSelect(file)}
                  >
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || ""}
                      className="h-full w-full object-cover"
                    />
                    {value === file.url && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary-500 p-1 text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
