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

    const faqItems = await prisma.faqItem.findMany({
      include: {
        service: true,
        subcategory: true,
      },
      orderBy: [{ pageKey: "asc" }, { order: "asc" }],
    })

    return NextResponse.json(faqItems)
  } catch (error) {
    console.error("Error fetching FAQ:", error)
    return NextResponse.json(
      { error: "Failed to fetch FAQ" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const maxOrder = await prisma.faqItem.aggregate({
      where: body.serviceId
        ? { serviceId: body.serviceId }
        : body.subcategoryId
        ? { subcategoryId: body.subcategoryId }
        : body.pageKey
        ? { pageKey: body.pageKey }
        : {},
      _max: { order: true },
    })

    const faqItem = await prisma.faqItem.create({
      data: {
        question: body.question,
        answer: body.answer,
        order: body.order ?? (maxOrder._max.order ?? -1) + 1,
        serviceId: body.serviceId,
        subcategoryId: body.subcategoryId,
        pageKey: body.pageKey,
      },
    })

    return NextResponse.json(faqItem)
  } catch (error) {
    console.error("Error creating FAQ:", error)
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    )
  }
}
