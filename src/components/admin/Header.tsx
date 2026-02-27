"use client"

import { useSession } from "next-auth/react"
import { Bell, User } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 bg-white shadow">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center lg:hidden">
          {/* Mobile menu button */}
        </div>

        <div className="flex flex-1 justify-end">
          <div className="flex items-center space-x-4">
            <button className="rounded-full p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6 shrink-0" aria-hidden="true" />
            </button>

            <div className="flex items-center space-x-3">
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
