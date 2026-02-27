import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardStats } from "@/components/admin/DashboardStats"
import { RecentSubmissions } from "@/components/admin/RecentSubmissions"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  // Получаем статистику
  const [servicesCount, blogPostsCount, casesCount, submissionsCount] = await Promise.all([
    prisma.service.count(),
    prisma.blogPost.count(),
    prisma.case.count({ where: { isActive: true } }),
    prisma.formSubmission.count({ where: { isRead: false } }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="mt-1 text-sm text-gray-500">
          Добро пожаловать, {session.user.name}!
        </p>
      </div>

      <DashboardStats
        services={servicesCount}
        blogPosts={blogPostsCount}
        cases={casesCount}
        unreadSubmissions={submissionsCount}
      />

      <RecentSubmissions />
    </div>
  )
}
