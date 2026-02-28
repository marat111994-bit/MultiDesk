import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subId } = await params

    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subId },
      include: {
        fkkoItems: { orderBy: { order: "asc" } },
        pricing: { orderBy: { order: "asc" } },
        faqItems: { orderBy: { order: "asc" } },
        advantages: { orderBy: { order: "asc" } },
      },
    })

    if (!subcategory) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 })
    }

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("Error fetching subcategory:", error)
    return NextResponse.json(
      { error: "Failed to fetch subcategory" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subId } = await params
    const body = await request.json()

    const subcategory = await prisma.subcategory.update({
      where: { id: subId },
      data: {
        slug: body.slug,
        title: body.title,
        shortTitle: body.shortTitle,
        description: body.description,
        shortDescription: body.shortDescription,
        heroImage: body.heroImage,
        heroImageAlt: body.heroImageAlt,
        badges: JSON.stringify(body.badges || []),
        order: body.order,
        isActive: body.isActive,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoH1: body.seoH1,
        seoKeywords: JSON.stringify(body.seoKeywords || []),
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("Error updating subcategory:", error)
    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subId } = await params

    await prisma.subcategory.delete({
      where: { id: subId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subcategory:", error)
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    )
  }
}
