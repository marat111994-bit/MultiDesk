import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
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
