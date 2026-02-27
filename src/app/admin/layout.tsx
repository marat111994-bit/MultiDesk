"use client"

import { SessionProvider } from "next-auth/react"
import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"
import { useState } from "react"
import { useUnreadSubmissions } from "@/components/admin/useUnreadSubmissions"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { count: unreadCount } = useUnreadSubmissions()

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Сайдбар */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
        />

        {/* Контентная область */}
        <div className="lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
