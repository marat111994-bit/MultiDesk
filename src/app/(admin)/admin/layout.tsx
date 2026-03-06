"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"
import { ToastProvider } from "@/components/admin/Toast"
import { useState, useEffect } from "react"
import { useUnreadSubmissions } from "@/components/admin/useUnreadSubmissions"
import { useRouter, usePathname } from "next/navigation"

interface AdminLayoutContentProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Не применяем этот layout к странице логина
  if (pathname === "/admin/login") {
    return <>{children}</>
  }
  
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Если статус loading - ждем
    if (status === "loading") return

    // Если не авторизован и не на логине - редирект на логин
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      const callbackUrl = encodeURIComponent(pathname)
      router.replace(`/admin/login?callbackUrl=${callbackUrl}`)
    }
  }, [status, router, pathname])

  // Пока идет проверка авторизации - показываем лоадер
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Если не авторизован - не рендерим контент (будет редирект)
  if (status === "unauthenticated") {
    return null
  }

  // Авторизован - рендерим layout с хуком
  return (
    <AdminLayoutInner sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {children}
    </AdminLayoutInner>
  )
}

function AdminLayoutInner({
  children,
  sidebarOpen,
  setSidebarOpen,
}: {
  children: React.ReactNode
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  const { count: unreadCount } = useUnreadSubmissions()

  return (
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
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ToastProvider>
    </SessionProvider>
  )
}
