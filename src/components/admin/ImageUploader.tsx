"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  value?: string
  onChange: (value: string) => void
  alt?: string
  onAltChange?: (value: string) => void
  label?: string
}

export function ImageUploader({
  value,
  onChange,
  alt,
  onAltChange,
  label = "Изображение",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "services")

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Ошибка при загрузке")
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Ошибка при загрузке изображения")
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".svg"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
  })

  const handleRemove = () => {
    onChange("")
  }

  return (
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
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
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
              <p className="text-sm text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive ? (
                  "Отпустите файл для загрузки"
                ) : (
                  <>
                    <span className="font-medium text-primary-600">
                      Нажмите для загрузки
                    </span>{" "}
                    или перетащите изображение
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WebP, SVG (макс. 5MB)
              </p>
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
  )
}
