"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Briefcase,
  Users,
  MessageSquare,
  Image,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Дашборд", href: "/admin", icon: LayoutDashboard },
  { name: "Услуги", href: "/admin/services", icon: FolderOpen },
  { name: "Блог", href: "/admin/blog", icon: FileText },
  { name: "Кейсы", href: "/admin/cases", icon: Briefcase },
  { name: "Клиенты", href: "/admin/clients", icon: Users },
  { name: "FAQ", href: "/admin/faq", icon: MessageSquare },
  { name: "Медиа", href: "/admin/media", icon: Image },
  { name: "Заявки", href: "/admin/submissions", icon: Inbox, badge: true },
  { name: "Настройки", href: "/admin/settings", icon: Settings },
]

interface SidebarProps {
  unreadCount?: number
  onToggle?: () => void
  isOpen?: boolean
}

export function Sidebar({ unreadCount = 0, onToggle, isOpen = true }: SidebarProps) {
  const pathname = usePathname()
  const [localUnread, setLocalUnread] = useState(unreadCount)

  useEffect(() => {
    setLocalUnread(unreadCount)
  }, [unreadCount])

  return (
    <>
      {/* Overlay для мобильных */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Сайдбар */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Заголовок с кнопкой закрытия для мобильных */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="text-xl font-bold text-white">
            DanMax Admin
          </Link>
          <button
            onClick={onToggle}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            const showBadge = item.badge && localUnread > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-800 text-white border-l-3 border-primary-500"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-3 h-5 w-5 shrink-0",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                    {localUnread > 9 ? "9+" : localUnread}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Разделитель и ссылка на сайт */}
        <div className="border-t border-gray-800 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <ExternalLink className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
            Открыть сайт
          </Link>
        </div>

        {/* Кнопка выхода */}
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
            Выйти
          </button>
        </div>
      </aside>
    </>
  )
}
