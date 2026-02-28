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

    const cases = await prisma.case.findMany({
      include: {
        service: true,
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(cases)
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
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

    const maxOrder = await prisma.case.aggregate({
      _max: { order: true },
    })

    const caseItem = await prisma.case.create({
      data: {
        title: body.title,
        image: body.image,
        imageAlt: body.imageAlt,
        volume: body.volume,
        duration: body.duration,
        description: body.description,
        order: body.order ?? (maxOrder._max.order ?? -1) + 1,
        isActive: body.isActive ?? true,
        serviceId: body.serviceId,
      },
    })

    return NextResponse.json(caseItem)
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    )
  }
}
