import { prisma } from './prisma'
import { cache } from 'react'

// ==================== УСЛУГИ ====================

export const getServices = cache(async () => {
  return prisma.service.findMany({
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
})

export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findUnique({
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

  return subcategory
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
