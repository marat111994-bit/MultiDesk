"use client"

import { useEffect, useState } from "react"

export function useUnreadSubmissions() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/submissions")
        if (res.ok) {
          const data = await res.json()
          const unreadCount = data.filter((s: any) => !s.isRead).length
          setCount(unreadCount)
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
