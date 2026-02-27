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
  Settings,
  Inbox,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Дашборд", href: "/admin", icon: LayoutDashboard },
  { name: "Услуги", href: "/admin/services", icon: FolderOpen },
  { name: "Блог", href: "/admin/blog", icon: FileText },
  { name: "Кейсы", href: "/admin/cases", icon: Briefcase },
  { name: "Клиенты", href: "/admin/clients", icon: Users },
  { name: "Настройки", href: "/admin/settings", icon: Settings },
  { name: "Заявки", href: "/admin/submissions", icon: Inbox },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 lg:translate-x-0">
      <div className="flex h-16 items-center px-6">
        <Link href="/admin" className="text-xl font-bold text-white">
          DanMax Admin
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
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
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
          Выйти
        </button>
      </div>
    </div>
  )
}
