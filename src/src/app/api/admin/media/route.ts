import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { writeFile, mkdir, rm } from "fs/promises"
import { join } from "path"
import { transliterate } from "transliteration"

// Разрешённые форматы
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Slugify имени файла:
 * - Транслитерация кириллицы
 * - Замена пробелов и спецсимволов на дефис
 * - Нижний регистр
 * - Удаление двойных дефисов
 */
function slugifyFilename(filename: string): string {
  // Получаем имя без расширения
  const lastDotIndex = filename.lastIndexOf(".")
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
  const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : ""

  // Транслитерация
  let slug = transliterate(name)

  // Нижний регистр
  slug = slug.toLowerCase()

  // Замена пробелов и спецсимволов на дефис
  slug = slug.replace(/[^a-z0-9-]/g, "-")

  // Удаление двойных дефисов
  slug = slug.replace(/-+/g, "-")

  // Удаление дефисов с краёв
  slug = slug.replace(/^-+|-+$/g, "")

  // Если пусто — ставим "image"
  if (!slug) slug = "image"

  return ext ? `${slug}.${ext}` : slug
}

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
    const alt = (formData.get("alt") as string) || ""

    // Валидация файла
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_MIMETYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат файла. Допустимы: JPG, PNG, WebP, SVG, GIF" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Файл слишком большой (макс. 10 МБ)" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const metadata = await sharp(buffer).metadata()

    // Определяем расширение
    const isSvg = file.type === "image/svg+xml"
    
    // Slugify имени файла
    const slugifiedName = slugifyFilename(file.name)
    const baseName = slugifiedName.replace(/\.(jpe?g|png|webp|gif|svg)$/i, "")
    
    // Формируем имя с timestamp
    const timestamp = Date.now()
    const extension = isSvg ? "svg" : "webp"
    const baseFilename = `${timestamp}-${baseName}`

    // Путь сохранения: public/uploads/[folder]/
    const uploadDir = join(process.cwd(), "public", "uploads", folder)
    await mkdir(uploadDir, { recursive: true })

    let url: string
    let thumbnailUrl: string | null = null
    let mediumUrl: string | null = null

    if (isSvg) {
      // SVG сохраняем как есть
      const filename = `${baseFilename}.svg`
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)
      
      url = `/uploads/${folder}/${filename}`
      thumbnailUrl = url
      mediumUrl = url
    } else {
      // Конвертируем в WebP с 3 размерами
      const originalFilename = `${baseFilename}.webp`
      const mediumFilename = `${baseFilename}-md.webp`
      const thumbFilename = `${baseFilename}-thumb.webp`

      const originalPath = join(uploadDir, originalFilename)
      const mediumPath = join(uploadDir, mediumFilename)
      const thumbPath = join(uploadDir, thumbFilename)

      // Original (max 1920px)
      await sharp(buffer)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(originalPath)

      // Medium (800px)
      await sharp(buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(mediumPath)

      // Thumbnail (300px cover)
      await sharp(buffer)
        .resize(300, 300, { fit: "cover", position: "center" })
        .webp({ quality: 80 })
        .toFile(thumbPath)

      url = `/uploads/${folder}/${originalFilename}`
      mediumUrl = `/uploads/${folder}/${mediumFilename}`
      thumbnailUrl = `/uploads/${folder}/${thumbFilename}`
    }

    // Сохраняем в БД
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: file.name,
        filepath: join("public", "uploads", folder, isSvg ? `${baseFilename}.svg` : `${baseFilename}.webp`),
        url,
        thumbnailUrl: thumbnailUrl || undefined,
        mediumUrl: mediumUrl || undefined,
        mimetype: isSvg ? "image/svg+xml" : "image/webp",
        size: file.size,
        width: metadata.width || null,
        height: metadata.height || null,
        alt: alt || "",
        folder,
      },
    })

    return NextResponse.json({
      id: mediaFile.id,
      url,
      mediumUrl,
      thumbnailUrl,
      alt: mediaFile.alt,
      width: mediaFile.width,
      height: mediaFile.height,
      filename: mediaFile.filename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки. Попробуйте ещё раз." },
      { status: 500 }
    )
  }
}
