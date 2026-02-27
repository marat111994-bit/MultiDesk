import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"

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

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json(mediaFile)
  } catch (error) {
    console.error("Error fetching media file:", error)
    return NextResponse.json(
      { error: "Failed to fetch media file" },
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

    const mediaFile = await prisma.mediaFile.update({
      where: { id },
      data: {
        alt: body.alt,
        folder: body.folder,
      },
    })

    return NextResponse.json(mediaFile)
  } catch (error) {
    console.error("Error updating media file:", error)
    return NextResponse.json(
      { error: "Failed to update media file" },
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

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Удаляем файлы с диска
    try {
      const { dirname, basename } = await import("path")
      const { readdir } = await import("fs/promises")
      
      const dir = dirname(mediaFile.filepath)
      const baseName = basename(mediaFile.filepath, ".webp")

      // Находим все версии файла
      const files = await readdir(dir)
      const relatedFiles = files.filter(f => f.startsWith(baseName))

      // Удаляем каждый файл
      for (const file of relatedFiles) {
        await unlink(`${dir}/${file}`)
      }
    } catch (e) {
      console.error("Error deleting files:", e)
    }

    // Удаляем из БД
    await prisma.mediaFile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting media file:", error)
    return NextResponse.json(
      { error: "Failed to delete media file" },
      { status: 500 }
    )
  }
}
