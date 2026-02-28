import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: {
            fkkoItems: true,
            pricing: true,
            faqItems: true,
            advantages: true,
          },
          orderBy: { order: "asc" },
        },
        pricing: true,
        faqItems: { orderBy: { order: "asc" } },
        advantages: { orderBy: { order: "asc" } },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const service = await prisma.service.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        shortTitle: body.shortTitle,
        description: body.description,
        shortDescription: body.shortDescription,
        heroImage: body.heroImage,
        heroImageAlt: body.heroImageAlt,
        badges: JSON.stringify(body.badges || []),
        trustNumbers: JSON.stringify(body.trustNumbers || []),
        order: body.order,
        isActive: body.isActive,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoH1: body.seoH1,
        seoKeywords: JSON.stringify(body.seoKeywords || []),
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
}
