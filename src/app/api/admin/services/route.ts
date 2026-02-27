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

    const services = await prisma.service.findMany({
      include: {
        subcategories: true,
        pricing: true,
        faqItems: true,
        advantages: true,
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const service = await prisma.service.create({
      data: {
        slug: body.slug,
        title: body.title,
        shortTitle: body.shortTitle,
        description: body.description,
        shortDescription: body.shortDescription,
        heroImage: body.heroImage,
        heroImageAlt: body.heroImageAlt,
        badges: JSON.stringify(body.badges || []),
        order: body.order || 0,
        isActive: body.isActive ?? true,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoH1: body.seoH1,
        seoKeywords: JSON.stringify(body.seoKeywords || []),
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
