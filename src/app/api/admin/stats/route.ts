import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
