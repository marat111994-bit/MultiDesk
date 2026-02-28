import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { services } = body // [{ id, order }]

    // Обновляем порядок всех услуг в транзакции
    await prisma.$transaction(
      services.map((service: { id: string; order: number }) =>
        prisma.service.update({
          where: { id: service.id },
          data: { order: service.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering services:", error)
    return NextResponse.json(
      { error: "Failed to reorder services" },
      { status: 500 }
    )
  }
}
