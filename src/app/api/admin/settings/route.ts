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

    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ group: "asc" }, { order: "asc" }],
    })

    // Группируем настройки по group
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = {}
      }
      acc[setting.group][setting.key] = setting.value
      return acc
    }, {} as Record<string, Record<string, string>>)

    return NextResponse.json(grouped)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

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
    // body имеет вид: { contacts: { phone: "...", email: "..." }, company: {...}, ... }

    const updates = Object.entries(body).flatMap(([group, values]) =>
      Object.entries(values as Record<string, string>).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: {
            key,
            value,
            label: key.split(".").pop() || key,
            group,
          },
        })
      )
    )

    await prisma.$transaction(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
