"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { X, Search, Upload, Image as ImageIcon, Check } from "lucide-react"

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

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string, alt: string) => void
  folder?: string
}

const FOLDERS = [
  { value: "all", label: "Все файлы" },
  { value: "hero", label: "Hero" },
  { value: "why-us", label: "Преимущества" },
  { value: "cases", label: "Кейсы" },
  { value: "blog", label: "Блог" },
  { value: "clients", label: "Клиенты" },
  { value: "services", label: "Услуги" },
  { value: "general", label: "Общее" },
]

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  folder: initialFolder = "general",
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState(initialFolder)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [uploading, setUploading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  // Загрузка файлов
  const fetchFiles = useCallback(async (reset = false) => {
    if (reset) {
      setPage(1)
      setFiles([])
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        folder: selectedFolder === "all" ? "" : selectedFolder,
        search: searchQuery,
        page: String(reset ? 1 : page),
        limit: "20",
      })

      const response = await fetch(`/api/admin/media?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(prev => reset ? data.files : [...prev, ...data.files])
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching media:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedFolder, searchQuery, page])

  useEffect(() => {
    if (isOpen) {
      fetchFiles(true)
    }
  }, [isOpen, selectedFolder, searchQuery])

  // Загрузка по клику "Показать ещё"
  const loadMore = () => {
    if (page < totalPages) {
      setPage(p => p + 1)
    }
  }

  // Обработка загрузки файла
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", selectedFolder === "all" ? "general" : selectedFolder)

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Ошибка загрузки")
      }

      const data = await response.json()
      
      // Обновляем список и выбираем новый файл
      await fetchFiles(true)
      setSelectedFile({
        id: data.id,
        filename: data.filename,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        mediumUrl: data.mediumUrl,
        mimetype: data.mimetype,
        size: data.size,
        width: data.width,
        height: data.height,
        alt: data.alt,
        folder: selectedFolder === "all" ? "general" : selectedFolder,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Upload error:", error)
      alert("Ошибка при загрузке файла")
    } finally {
      setUploading(false)
    }
  }, [selectedFolder, fetchFiles])

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

  // Выбор файла
  const handleSelect = (file: MediaFile) => {
    setSelectedFile(file)
  }

  // Двойной клик - выбрать и закрыть
  const handleDoubleClick = (file: MediaFile) => {
    onSelect(file.url, file.alt || "")
    onClose()
  }

  // Кнопка "Выбрать"
  const handleConfirm = () => {
    if (selectedFile) {
      onSelect(selectedFile.url, selectedFile.alt || "")
      onClose()
    }
  }

  // Форматирование размера
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Медиа-библиотека
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
            {FOLDERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && files.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
              <p className="text-lg font-medium">Нет изображений</p>
              <p className="text-sm">Загрузите первое изображение</p>
            </div>
          ) : (
            <>
              {/* Сетка изображений */}
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleSelect(file)}
                    onDoubleClick={() => handleDoubleClick(file)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border transition-all ${
                      selectedFile?.id === file.id
                        ? "border-primary-500 ring-2 ring-primary-500"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || file.filename}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {selectedFile?.id === file.id && (
                      <div className="absolute right-1 top-1 rounded-full bg-primary-500 p-1 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {file.filename}
                    </div>
                  </button>
                ))}
              </div>

              {/* Кнопка "Показать ещё" */}
              {page < totalPages && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading ? "Загрузка..." : "Показать ещё"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Зона загрузки */}
        <div className="border-t p-6">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-6 py-4 text-center transition-colors ${
              isDragActive
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                Загрузка...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Upload className="h-4 w-4" />
                <span>
                  Перетащите файл сюда или{" "}
                  <span className="font-medium text-primary-600">нажмите</span>
                </span>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            JPG, PNG, WebP, SVG, GIF • до 10 МБ
          </p>
        </div>

        {/* Подвал с кнопками */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          {selectedFile ? (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedFile.filename}</span>
              {" • "}
              {formatSize(selectedFile.size)}
              {selectedFile.width && selectedFile.height && (
                <>
                  {" • "}
                  {selectedFile.width}×{selectedFile.height}
                </>
              )}
            </div>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedFile}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Выбрать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
