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

    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        service: true,
      },
    })

    if (!caseItem) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json(caseItem)
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json(
      { error: "Failed to fetch case" },
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

    const caseItem = await prisma.case.update({
      where: { id },
      data: {
        title: body.title,
        image: body.image,
        imageAlt: body.imageAlt,
        volume: body.volume,
        duration: body.duration,
        description: body.description,
        order: body.order,
        isActive: body.isActive,
        serviceId: body.serviceId,
      },
    })

    return NextResponse.json(caseItem)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json(
      { error: "Failed to update case" },
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

    await prisma.case.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    )
  }
}
