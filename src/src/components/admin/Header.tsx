"use client"

import { useSession } from "next-auth/react"
import { Bell, User, Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Кнопка меню для мобильных */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Логотип для десктопа */}
        <div className="hidden lg:flex lg:items-center lg:space-x-3">
          <span className="text-lg font-semibold text-gray-900">DanMax Admin</span>
        </div>

        {/* Правая часть */}
        <div className="flex flex-1 justify-end">
          <div className="flex items-center space-x-4">
            {/* Уведомления */}
            <button className="relative rounded-full p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
              </span>
            </button>

            {/* Профиль пользователя */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="hidden text-sm text-gray-700 lg:block">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                <User className="h-5 w-5 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
