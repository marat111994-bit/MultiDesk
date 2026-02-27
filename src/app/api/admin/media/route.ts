import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { writeFile, mkdir } from "fs/promises"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const where: any = {}
    if (folder && folder !== "all") {
      where.folder = folder
    }
    if (search) {
      where.filename = { contains: search, mode: "insensitive" }
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mediaFile.count({ where }),
    ])

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json(
      { error: "Failed to fetch media files" },
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const metadata = await sharp(buffer).metadata()

    // Создаём дату для пути
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")

    // Определяем расширение
    const isSvg = file.type === "image/svg+xml"
    const extension = isSvg ? "svg" : "webp"
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    
    const uploadPath = `public/uploads/${year}/${month}`
    const filepath = `${process.cwd()}/${uploadPath}/${filename}`
    const url = `/uploads/${year}/${month}/${filename}`

    // Создаём директорию
    await mkdir(`${process.cwd()}/${uploadPath}`, { recursive: true })

    // Обработка через Sharp
    if (isSvg) {
      // SVG просто копируем
      await writeFile(filepath, buffer)
    } else {
      // Конвертируем в WebP с созданием 3 размеров
      const thumbnailPath = filepath.replace(/\.webp$/, "-thumb.webp")
      const mediumPath = filepath.replace(/\.webp$/, "-medium.webp")

      // Thumbnail (300px)
      await sharp(buffer)
        .resize(300, 300, { fit: "cover", position: "center" })
        .webp({ quality: 80 })
        .toFile(thumbnailPath)

      // Medium (800px)
      await sharp(buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(mediumPath)

      // Original (max 1920px)
      await sharp(buffer)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(filepath)
    }

    // Сохраняем в БД
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

    // Возвращаем URL с thumbnail для сетки
    const thumbnailUrl = isSvg ? url : url.replace(/\.webp$/, "-thumb.webp")

    return NextResponse.json({
      id: mediaFile.id,
      url,
      thumbnailUrl,
      filename: mediaFile.filename,
      width: mediaFile.width,
      height: mediaFile.height,
      size: mediaFile.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
