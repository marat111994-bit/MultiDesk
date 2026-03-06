"use client"

import { SessionProvider } from "next-auth/react"

interface AdminLoginLayoutProps {
  children: React.ReactNode
}

export default function AdminLoginLayout({ children }: AdminLoginLayoutProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
