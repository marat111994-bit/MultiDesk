import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Начало и конец текущего месяца
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Получаем всю статистику параллельно
    const [
      servicesCount,
      servicesActiveCount,
      subcategoriesCount,
      subcategoriesActiveCount,
      blogPostsCount,
      blogPublishedCount,
      blogDraftCount,
      casesCount,
      casesActiveCount,
      clientsCount,
      clientsActiveCount,
      submissionsCount,
      submissionsNewCount,
      mediaCount,
      // Статистика калькулятора
      totalCalculations,
      todayCalculations,
      totalRevenueResult,
      // Заявки сегодня (объединённые)
      todaySubmissionsCount,
      // Сумма расчётов за месяц (completed)
      monthlyRevenueResult,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.subcategory.count(),
      prisma.subcategory.count({ where: { isActive: true } }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { isPublished: false } }),
      prisma.case.count(),
      prisma.case.count({ where: { isActive: true } }),
      prisma.client.count(),
      prisma.client.count({ where: { isActive: true } }),
      prisma.formSubmission.count(),
      prisma.formSubmission.count({ where: { isRead: false } }),
      prisma.mediaFile.count(),
      // Калькулятор
      prisma.calculation.count(),
      prisma.calculation.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.calculation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          status: 'completed',
        },
      }),
      // Заявки с сайта сегодня
      prisma.formSubmission.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Сумма completed расчётов за текущий месяц
      prisma.calculation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          status: 'completed',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
    ])

    return NextResponse.json({
      services: {
        total: servicesCount,
        active: servicesActiveCount,
      },
      subcategories: {
        total: subcategoriesCount,
        active: subcategoriesActiveCount,
      },
      blog: {
        total: blogPostsCount,
        published: blogPublishedCount,
        drafts: blogDraftCount,
      },
      cases: {
        total: casesCount,
        active: casesActiveCount,
      },
      clients: {
        total: clientsCount,
        active: clientsActiveCount,
      },
      submissions: {
        total: submissionsCount,
        new: submissionsNewCount,
      },
      media: {
        total: mediaCount,
      },
      calculator: {
        totalCalculations,
        todayCalculations,
        totalRevenue: totalRevenueResult._sum.totalPrice || 0,
      },
      orders: {
        today: (todaySubmissionsCount || 0) + (todayCalculations || 0),
        monthlyRevenue: monthlyRevenueResult._sum.totalPrice || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
