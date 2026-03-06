"use client"

import { useState, useEffect, useCallback } from "react"
import { clsx } from "clsx"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  Image,
  Grid3X3,
  List,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
  Loader2,
} from "lucide-react"

interface MediaFile {
  id: string
  filename: string
  url: string
  thumbnailUrl?: string
  alt: string | null
  folder: string
  mimetype: string
  size: number
  width: number | null
  height: number | null
  createdAt: string
}

type ViewMode = "grid" | "list"
type FolderFilter = "all" | "hero" | "cases" | "blog" | "clients" | "general"

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all")
  const [search, setSearch] = useState("")
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [folderFilter, search])

  async function fetchFiles() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (folderFilter !== "all") params.set("folder", folderFilter)
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
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setUploading((prev) => [...prev, file.name])

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", folderFilter === "all" ? "general" : folderFilter)

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        })

        if (res.ok) {
          fetchFiles()
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert(`Ошибка загрузки ${file.name}`)
      } finally {
        setUploading((prev) => prev.filter((name) => name !== file.name))
      }
    }
  }, [folderFilter])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"],
    },
    multiple: true,
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
  })

  async function handleDelete(id: string) {
    if (!confirm("Удалить файл?")) return
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchFiles()
        if (selectedFile?.id === id) setSelectedFile(null)
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  async function handleSave() {
    if (!editingFile) return
    try {
      const res = await fetch(`/api/admin/media/${editingFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt: editingFile.alt,
          folder: editingFile.folder,
        }),
      })
      if (res.ok) {
        setEditingFile(null)
        fetchFiles()
      }
    } catch (error) {
      console.error("Save error:", error)
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const folders: { value: FolderFilter; label: string }[] = [
    { value: "all", label: "Все" },
    { value: "hero", label: "Hero" },
    { value: "cases", label: "Кейсы" },
    { value: "blog", label: "Блог" },
    { value: "clients", label: "Клиенты" },
    { value: "general", label: "Прочее" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Медиа-библиотека</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управление изображениями сайта
        </p>
      </div>

      {/* Верхняя панель */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          {...getRootProps()}
          className={clsx(
            "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium",
            isDragActive
              ? "bg-primary-100 text-primary-700"
              : "bg-primary-600 text-white hover:bg-primary-700"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mr-2 h-4 w-4" />
          Загрузить
        </button>

        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск файлов..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value as FolderFilter)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
            {folders.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="flex rounded-md border border-gray-300">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2",
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2",
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Зона загрузки при drag & drop */}
      {isDragActive && (
        <div className="mb-6 rounded-lg border-2 border-dashed border-primary-500 bg-primary-50 p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-primary-400" />
          <p className="mt-4 text-lg font-medium text-primary-700">
            Перетащите файлы сюда
          </p>
          <p className="text-sm text-primary-600">
            JPG, PNG, WebP, SVG, GIF (макс. 10MB, до 10 файлов)
          </p>
        </div>
      )}

      {/* Прогресс загрузки */}
      {uploading.length > 0 && (
        <div className="mb-6 space-y-2">
          {uploading.map((name) => (
            <div key={name} className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
              <span className="text-sm text-gray-600">{name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Сетка/список файлов */}
      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Загрузка...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">Нет файлов</p>
          <p className="text-sm text-gray-500">
            Загрузите изображения или выберите другую папку
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
              onClick={() => setSelectedFile(file)}
            >
              <img
                src={file.thumbnailUrl || file.url}
                alt={file.alt || file.filename}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40">
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(file)
                    }}
                    className="rounded-full bg-white p-2 text-gray-700 hover:text-gray-900"
                    title="Просмотр"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingFile(file)
                    }}
                    className="rounded-full bg-white p-2 text-gray-700 hover:text-gray-900"
                    title="Редактировать"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(file.id)
                    }}
                    className="rounded-full bg-white p-2 text-red-600 hover:text-red-700"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="truncate text-xs text-white" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-gray-300">{formatSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Изображение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Имя файла
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Размер
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Папка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedFile(file)}
                >
                  <td className="px-6 py-4">
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || ""}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {file.filename}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                    {file.width && file.height && (
                      <p className="text-xs text-gray-400">
                        {file.width} × {file.height}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {file.folder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFile(file)
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(file.id)
                      }}
                      className="ml-3 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно просмотра */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="relative max-h-[90vh] overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <img
              src={selectedFile.url}
              alt={selectedFile.alt || ""}
              className="mx-auto max-h-[60vh] w-full object-contain"
            />

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{selectedFile.filename}</h3>
                <p className="text-sm text-gray-500">
                  {formatSize(selectedFile.size)}
                  {selectedFile.width && selectedFile.height && (
                    <> • {selectedFile.width} × {selectedFile.height} px</>
                  )}
                  • {new Date(selectedFile.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={`${process.env.NEXT_PUBLIC_SITE_URL || ""}${selectedFile.url}`}
                    readOnly
                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() =>
                      copyUrl(`${process.env.NEXT_PUBLIC_SITE_URL || ""}${selectedFile.url}`)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {copiedUrl === selectedFile.url ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingFile(selectedFile)
                    setSelectedFile(null)
                  }}
                  className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(selectedFile.id)}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editingFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setEditingFile(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Редактирование
            </h3>

            <div className="mb-4">
              <img
                src={editingFile.url}
                alt={editingFile.alt || ""}
                className="max-h-48 w-full object-contain"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                ALT-тег
              </label>
              <input
                type="text"
                value={editingFile.alt || ""}
                onChange={(e) =>
                  setEditingFile({ ...editingFile, alt: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="Описание изображения"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Папка
              </label>
              <select
                value={editingFile.folder}
                onChange={(e) =>
                  setEditingFile({ ...editingFile, folder: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                {folders
                  .filter((f) => f.value !== "all")
                  .map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditingFile(null)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
