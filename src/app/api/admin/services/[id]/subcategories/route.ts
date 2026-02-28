import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const subcategories = await prisma.subcategory.findMany({
      where: { serviceId: id },
      include: {
        fkkoItems: true,
        pricing: true,
        faqItems: true,
        advantages: true,
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const maxOrder = await prisma.subcategory.aggregate({
      where: { serviceId: id },
      _max: { order: true },
    })

    const subcategory = await prisma.subcategory.create({
      data: {
        serviceId: id,
        slug: body.slug,
        title: body.title,
        shortTitle: body.shortTitle,
        description: body.description,
        shortDescription: body.shortDescription,
        heroImage: body.heroImage,
        heroImageAlt: body.heroImageAlt,
        badges: JSON.stringify(body.badges || []),
        order: body.order ?? (maxOrder._max.order ?? -1) + 1,
        isActive: body.isActive ?? true,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoH1: body.seoH1,
        seoKeywords: JSON.stringify(body.seoKeywords || []),
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("Error creating subcategory:", error)
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    )
  }
}
