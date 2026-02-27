import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Обработка изображения через sharp
    const metadata = await sharp(buffer).metadata()
    const extension = file.type === "image/png" ? "png" : 
                      file.type === "image/webp" ? "webp" : "jpg"
    
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    const filepath = join(process.cwd(), "public", "uploads", folder, filename)
    const url = `/uploads/${folder}/${filename}`

    // Создание директории
    await mkdir(join(process.cwd(), "public", "uploads", folder), { recursive: true })

    // Оптимизация и сохранение
    await sharp(buffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .toFormat(extension, { quality: 85 })
      .toFile(filepath)

    // Сохранение в базу данных
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: file.name,
        filepath,
        url,
        mimetype: file.type,
        size: file.size,
        width: metadata.width || null,
        height: metadata.height || null,
        folder,
      },
    })

    return NextResponse.json({
      id: mediaFile.id,
      url,
      filename: mediaFile.filename,
      width: mediaFile.width,
      height: mediaFile.height,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
