"use client"

import { SessionProvider } from "next-auth/react"
import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
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
