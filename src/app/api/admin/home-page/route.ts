import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const homePage = await prisma.homePage.findFirst({
      where: { isActive: true },
    })

    if (!homePage) {
      // Возвращаем значения по умолчанию
      return NextResponse.json({
        heroTitle: "Вывоз и утилизация строительных отходов в Москве",
        heroSubtitle: "Грунт, бетон, кирпич, асфальт — вывозим и утилизируем с полным пакетом документов. Собственный автопарк, все лицензии.",
        heroImage: "/images/placeholder-hero.svg",
        heroImageAlt: "Вывоз строительных отходов DanMax",
        heroBadges: ["Лицензия 1–5 класс", "от 350 ₽/м³", "120+ единиц техники", "Работа 24/7"],
        whyUsImage: "/images/placeholder.svg",
        whyUsImageAlt: "Команда DanMax",
      })
    }

    return NextResponse.json({
      heroTitle: homePage.heroTitle,
      heroSubtitle: homePage.heroSubtitle,
      heroImage: homePage.heroImage || "/images/placeholder-hero.svg",
      heroImageAlt: homePage.heroImageAlt || "Вывоз строительных отходов DanMax",
      heroBadges: JSON.parse(homePage.heroBadges),
      whyUsImage: homePage.whyUsImage || "/images/placeholder.svg",
      whyUsImageAlt: homePage.whyUsImageAlt || "Команда DanMax",
    })
  } catch (error) {
    console.error('Error fetching home page settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Проверяем, существует ли запись
    const existing = await prisma.homePage.findFirst({
      where: { isActive: true },
    })

    if (existing) {
      // Обновляем
      await prisma.homePage.update({
        where: { id: existing.id },
        data: {
          heroTitle: body.heroTitle,
          heroSubtitle: body.heroSubtitle,
          heroImage: body.heroImage,
          heroImageAlt: body.heroImageAlt,
          heroBadges: JSON.stringify(body.heroBadges),
          whyUsImage: body.whyUsImage,
          whyUsImageAlt: body.whyUsImageAlt,
        },
      })
    } else {
      // Создаём
      await prisma.homePage.create({
        data: {
          heroTitle: body.heroTitle,
          heroSubtitle: body.heroSubtitle,
          heroImage: body.heroImage,
          heroImageAlt: body.heroImageAlt,
          heroBadges: JSON.stringify(body.heroBadges),
          whyUsImage: body.whyUsImage,
          whyUsImageAlt: body.whyUsImageAlt,
          isActive: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving home page settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
