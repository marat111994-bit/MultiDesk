"use client"

import { useEffect, useState } from "react"

export function useUnreadSubmissions() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/submissions?status=new", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
        if (res.ok) {
          const data = await res.json()
          // data.submissions — массив, data.pagination — мета
          const unreadCount = Array.isArray(data.submissions)
            ? data.submissions.length
            : 0
          setCount(unreadCount)
        } else if (res.status === 401) {
          // Не авторизован - просто не показываем счётчик
          setCount(0)
        }
      } catch (error) {
        console.error("Error fetching submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCount()
  }, [])

  return { count, loading }
}
