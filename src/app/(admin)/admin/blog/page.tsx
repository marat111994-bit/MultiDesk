"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, Copy, Eye, EyeOff } from "lucide-react"
import { clsx } from "clsx"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface BlogPost {
  id: string
  slug: string
  title: string
  author: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
}

type FilterStatus = "all" | "published" | "draft"

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [filter])

  async function fetchPosts() {
    try {
      const res = await fetch(`/api/admin/blog?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  async function togglePublish(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/blog/${id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      })
      if (res.ok) {
        setPosts(posts.map(p => p.id === id ? { ...p, isPublished: !current } : p))
      }
    } catch (error) {
      console.error("Error toggling publish:", error)
    }
  }

  async function duplicate(id: string) {
    try {
      const post = posts.find(p => p.id === id)
      if (!post) return

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          title: `${post.title} (копия)`,
          slug: `${post.slug}-copy`,
          isPublished: false,
        }),
      })
      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error duplicating:", error)
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Удалить статью?")) return
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Загрузка...</div>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Блог</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление статьями
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Написать статью
        </Link>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium",
            filter === "all"
              ? "bg-primary-100 text-primary-700"
              : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Все статьи
        </button>
        <button
          onClick={() => setFilter("published")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium",
            filter === "published"
              ? "bg-green-100 text-green-700"
              : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Опубликованные
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={clsx(
            "rounded-md px-4 py-2 text-sm font-medium",
            filter === "draft"
              ? "bg-gray-100 text-gray-700"
              : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Черновики
        </button>
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Заголовок
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Автор
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  {filter === "all"
                    ? "Статей пока нет"
                    : filter === "published"
                    ? "Опубликованных статей нет"
                    : "Черновиков нет"}
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-900"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-500">{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{post.author}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "dd.MM.yyyy", { locale: ru })
                        : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                        post.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {post.isPublished ? "Опубликовано" : "Черновик"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="mr-3 text-primary-600 hover:text-primary-900"
                    >
                      <Pencil className="inline h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => togglePublish(post.id, post.isPublished)}
                      className="mr-3 text-gray-600 hover:text-gray-900"
                      title={post.isPublished ? "Снять с публикации" : "Опубликовать"}
                    >
                      {post.isPublished ? (
                        <EyeOff className="inline h-4 w-4" />
                      ) : (
                        <Eye className="inline h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => duplicate(post.id)}
                      className="mr-3 text-gray-600 hover:text-gray-900"
                    >
                      <Copy className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
