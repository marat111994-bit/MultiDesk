import { prisma } from './prisma'
import { cache } from 'react'
import type { Badge } from '@/types/service'
import type { TrustNumber } from '@/types/common'

// Хелпер для парсинга badges из JSON строки в Badge[]
function parseBadges(badgesJson: string | null): Badge[] {
  if (!badgesJson) return []
  try {
    const parsed = JSON.parse(badgesJson)
    // Если это массив строк (старый формат)
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed.map((value: string) => ({ value, label: '', icon: 'shield-check' }))
    }
    // Если это массив объектов Badge (новый формат)
    if (Array.isArray(parsed)) {
      return parsed as Badge[]
    }
    return []
  } catch {
    return []
  }
}

// Хелпер для парсинга trustNumbers из JSON строки
function parseTrustNumbers(trustNumbersJson: string | null): TrustNumber[] {
  if (!trustNumbersJson) return []
  try {
    const parsed = JSON.parse(trustNumbersJson)
    if (Array.isArray(parsed)) {
      return parsed as TrustNumber[]
    }
    return []
  } catch {
    return []
  }
}

// ==================== УСЛУГИ ====================

export const getServices = cache(async () => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        include: {
          pricing: true,
          advantages: true,
        },
      },
      pricing: true,
      advantages: true,
    },
    orderBy: { order: 'asc' },
  })

  // Преобразуем badges из JSON строки в Badge[]
  return services.map(service => ({
    ...service,
    topBadge: service.topBadge || undefined,
    badges: parseBadges(service.badges as unknown as string),
    subcategories: service.subcategories.map(sub => ({
      ...sub,
      topBadge: sub.topBadge || undefined,
      badges: parseBadges(sub.badges as unknown as string),
    })),
  }))
})

export const getServiceBySlug = cache(async (slug: string) => {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      subcategories: {
        where: { isActive: true },
        include: {
          fkkoItems: true,
          pricing: true,
          faqItems: true,
          advantages: true,
        },
      },
      pricing: true,
      faqItems: true,
      advantages: true,
      cases: {
        where: { isActive: true },
      },
    },
  })

  if (!service) return null

  // Преобразуем badges из JSON строки в Badge[]
  return {
    ...service,
    topBadge: service.topBadge || undefined,
    badges: parseBadges(service.badges as unknown as string),
    trustNumbers: parseTrustNumbers(service.trustNumbers as unknown as string),
    subcategories: service.subcategories.map(sub => ({
      ...sub,
      topBadge: sub.topBadge || undefined,
      badges: parseBadges(sub.badges as unknown as string),
    })),
  }
})

export const getSubcategoryBySlug = cache(async (serviceSlug: string, subcategorySlug: string) => {
  const subcategory = await prisma.subcategory.findFirst({
    where: {
      slug: subcategorySlug,
      service: { slug: serviceSlug },
    },
    include: {
      service: true,
      fkkoItems: true,
      pricing: true,
      faqItems: true,
      advantages: true,
    },
  })

  if (!subcategory) return null

  return {
    ...subcategory,
    topBadge: subcategory.topBadge || undefined,
    badges: parseBadges(subcategory.badges as unknown as string),
    trustNumbers: parseTrustNumbers(subcategory.trustNumbers as unknown as string),
  }
})

// ==================== БЛОГ ====================

export const getBlogPosts = cache(async (limit = 10, offset = 0) => {
  return prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    skip: offset,
  })
})

export const getBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug },
  })
})

export const getBlogPostForPreview = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug },
  })
})

// ==================== КЕЙСЫ И КЛИЕНТЫ ====================

export const getCases = cache(async (serviceId?: string) => {
  return prisma.case.findMany({
    where: {
      isActive: true,
      serviceId: serviceId || undefined,
    },
    orderBy: { order: 'asc' },
  })
})

export const getClients = cache(async () => {
  return prisma.client.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
})

// ==================== FAQ ====================

export const getFaqByService = cache(async (serviceId: string) => {
  return prisma.faqItem.findMany({
    where: { serviceId },
    orderBy: { order: 'asc' },
  })
})

export const getFaqByPage = cache(async (pageKey: string) => {
  return prisma.faqItem.findMany({
    where: { pageKey },
    orderBy: { order: 'asc' },
  })
})

// ==================== НАСТРОЙКИ ====================

export const getSettings = cache(async () => {
  const settings = await prisma.siteSetting.findMany({
    orderBy: [{ group: 'asc' }, { order: 'asc' }],
  })

  // Группируем по group
  return settings.reduce((acc, setting) => {
    if (!acc[setting.group]) {
      acc[setting.group] = {}
    }
    acc[setting.group][setting.key] = setting.value
    return acc
  }, {} as Record<string, Record<string, string>>)
})

export const getContacts = cache(async () => {
  const settings = await prisma.siteSetting.findMany({
    where: { group: 'contacts' },
  })

  return settings.reduce((acc, setting) => {
    const key = setting.key.replace('contacts.', '')
    acc[key] = setting.value
    return acc
  }, {} as Record<string, string>)
})

export const getTrustNumbers = cache(async () => {
  const settings = await prisma.siteSetting.findMany({
    where: { group: 'home' },
  })

  const trustNumbers = settings
    .filter(s => s.key.startsWith('home.trustNumber.'))
    .map(s => JSON.parse(s.value))

  return trustNumbers
})

export const getSteps = cache(async () => {
  const settings = await prisma.siteSetting.findMany({
    where: { group: 'home' },
  })

  const steps = settings
    .filter(s => s.key.startsWith('home.step.'))
    .map(s => JSON.parse(s.value))

  return steps
})

export const getHomeAdvantages = cache(async () => {
  const settings = await prisma.siteSetting.findMany({
    where: { group: 'home' },
  })

  const advantages = settings
    .filter(s => s.key.startsWith('home.advantage.'))
    .map(s => JSON.parse(s.value))

  return advantages
})

// ==================== ГЛАВНАЯ СТРАНИЦА ====================

export const getHomePageSettings = cache(async () => {
  const homePage = await prisma.homePage.findFirst({
    where: { isActive: true },
  })

  if (!homePage) {
    // Значения по умолчанию
    return {
      heroTitle: "Вывоз и утилизация строительных отходов в Москве",
      heroSubtitle: "Грунт, бетон, кирпич, асфальт — вывозим и утилизируем с полным пакетом документов. Собственный автопарк, все лицензии.",
      heroImage: "/images/placeholder-hero.svg",
      heroImageAlt: "Вывоз строительных отходов DanMax",
      heroBadges: ["Лицензия 1–5 класс", "от 350 ₽/м³", "120+ единиц техники", "Работа 24/7"],
      whyUsImage: "/images/placeholder.svg",
      whyUsImageAlt: "Команда DanMax",
    }
  }

  return {
    heroTitle: homePage.heroTitle,
    heroSubtitle: homePage.heroSubtitle,
    heroImage: homePage.heroImage || "/images/placeholder-hero.svg",
    heroImageAlt: homePage.heroImageAlt || "Вывоз строительных отходов DanMax",
    heroBadges: JSON.parse(homePage.heroBadges),
    whyUsImage: homePage.whyUsImage || "/images/placeholder.svg",
    whyUsImageAlt: homePage.whyUsImageAlt || "Команда DanMax",
  }
})

// ==================== ПРОМО ====================

export const getPromo = cache(async () => {
  const settings = await prisma.siteSetting.findMany({
    where: { group: 'promo' },
  })

  const promo = settings.reduce((acc, setting) => {
    acc[setting.key.replace('promo.', '')] = setting.value
    return acc
  }, {} as Record<string, string>)

  return promo
})
