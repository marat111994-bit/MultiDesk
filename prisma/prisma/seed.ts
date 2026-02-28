import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Импорт данных из @/data
import { vyvozGrunta } from '@/data/services/vyvoz-grunta'
import { kirpichnyjBoj } from '@/data/services/kirpichnyj-boj'
import { betonnyjBoj } from '@/data/services/betonnyj-boj'
import { asfaltnyjBoj } from '@/data/services/asfaltnyj-boj'
import { smeshannyeOthody } from '@/data/services/smeshannye-othody'
import { razreshitelnayaDokumentaciya } from '@/data/services/razreshitelnaya-dokumentaciya'
import { cases } from '@/data/cases'
import { clients } from '@/data/clients'
import { contacts } from '@/data/contacts'
import { whyUs } from '@/data/whyUs'
import { steps } from '@/data/steps'
import { trustNumbers } from '@/data/trustNumbers'
import { blogPosts } from '@/data/blog'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Запуск seed-скрипта...')

  // ==================== ПОЛЬЗОВАТЕЛЬ ====================
  console.log('📝 Создание admin-пользователя...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@danmax.moscow' },
    update: {},
    create: {
      email: 'admin@danmax.moscow',
      password: hashedPassword,
      name: 'Администратор',
      role: 'admin',
    },
  })

  // ==================== УСЛУГИ ====================
  console.log('📦 Создание услуг...')
  
  const allServices = [
    vyvozGrunta,
    kirpichnyjBoj,
    betonnyjBoj,
    asfaltnyjBoj,
    smeshannyeOthody,
    razreshitelnayaDokumentaciya,
  ]

  for (const serviceData of allServices) {
    console.log(`  → ${serviceData.title}`)
    
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {},
      create: {
        slug: serviceData.slug,
        title: serviceData.title,
        shortTitle: serviceData.shortTitle,
        description: serviceData.description,
        shortDescription: serviceData.shortDescription,
        heroImage: serviceData.heroImage,
        heroImageAlt: serviceData.heroImageAlt,
        badges: JSON.stringify(serviceData.badges),
        order: 0,
        isActive: true,
        seoTitle: serviceData.seo.title,
        seoDescription: serviceData.seo.description,
        seoH1: serviceData.seo.h1,
        seoKeywords: JSON.stringify(serviceData.seo.keywords),
      },
    })

    // Преимущества услуги
    for (const [index, adv] of serviceData.advantages.entries()) {
      await prisma.advantage.create({
        data: {
          serviceId: service.id,
          title: adv.title,
          description: adv.description,
          icon: adv.icon,
          order: index,
        },
      })
    }

    // Цены услуги
    for (const [index, price] of serviceData.pricing.entries()) {
      await prisma.priceRow.create({
        data: {
          serviceId: service.id,
          serviceName: price.service,
          unit: price.unit,
          price: String(price.price),
          order: index,
        },
      })
    }

    // FAQ услуги
    for (const [index, faq] of serviceData.faq.entries()) {
      await prisma.faqItem.create({
        data: {
          serviceId: service.id,
          question: faq.question,
          answer: faq.answer,
          order: index,
        },
      })
    }

    // Подкатегории
    for (const subcatData of serviceData.subcategories || []) {
      console.log(`    → Подкатегория: ${subcatData.title}`)
      
      const subcategory = await prisma.subcategory.create({
        data: {
          slug: subcatData.slug,
          title: subcatData.title,
          shortTitle: subcatData.shortTitle,
          description: subcatData.description,
          shortDescription: subcatData.shortDescription,
          heroImage: subcatData.heroImage,
          heroImageAlt: subcatData.heroImageAlt,
          badges: JSON.stringify(subcatData.badges),
          order: 0,
          isActive: true,
          serviceId: service.id,
          seoTitle: subcatData.seo.title,
          seoDescription: subcatData.seo.description,
          seoH1: subcatData.seo.h1,
          seoKeywords: JSON.stringify(subcatData.seo.keywords),
        },
      })

      // ФККО подкатегории
      for (const [index, fkko] of subcatData.fkkoTable.entries()) {
        await prisma.fkkoRow.create({
          data: {
            subcategoryId: subcategory.id,
            code: fkko.code,
            name: fkko.name,
            hazardClass: fkko.hazardClass,
            order: index,
          },
        })
      }

      // Цены подкатегории
      for (const [index, price] of subcatData.pricing.entries()) {
        await prisma.priceRow.create({
          data: {
            subcategoryId: subcategory.id,
            serviceName: price.service,
            unit: price.unit,
            price: String(price.price),
            order: index,
          },
        })
      }

      // FAQ подкатегории
      for (const [index, faq] of subcatData.faq.entries()) {
        await prisma.faqItem.create({
          data: {
            subcategoryId: subcategory.id,
            question: faq.question,
            answer: faq.answer,
            order: index,
          },
        })
      }

      // Преимущества подкатегории
      for (const [index, adv] of subcatData.advantages.entries()) {
        await prisma.advantage.create({
          data: {
            subcategoryId: subcategory.id,
            title: adv.title,
            description: adv.description,
            icon: adv.icon,
            order: index,
          },
        })
      }
    }
  }

  // ==================== КЕЙСЫ ====================
  console.log('📁 Создание кейсов...')
  for (const [index, caseData] of cases.entries()) {
    await prisma.case.create({
      data: {
        title: caseData.title,
        image: caseData.image,
        imageAlt: caseData.title,
        volume: caseData.volume,
        duration: caseData.duration,
        description: caseData.description,
        order: index,
        isActive: true,
      },
    })
  }

  // ==================== КЛИЕНТЫ ====================
  console.log('👥 Создание клиентов...')
  for (const [index, clientData] of clients.entries()) {
    await prisma.client.create({
      data: {
        name: clientData.name,
        logo: clientData.logo,
        order: index,
        isActive: true,
      },
    })
  }

  // ==================== НАСТРОЙКИ САЙТА ====================
  console.log('⚙️ Создание настроек сайта...')
  
  const settings = [
    // Контакты
    { key: 'contacts.phone', value: contacts.phone, label: 'Телефон', group: 'contacts' },
    { key: 'contacts.telegram', value: contacts.telegram, label: 'Telegram', group: 'contacts' },
    { key: 'contacts.whatsapp', value: contacts.whatsapp, label: 'WhatsApp', group: 'contacts' },
    { key: 'contacts.email', value: contacts.email, label: 'Email', group: 'contacts' },
    { key: 'contacts.address', value: contacts.address, label: 'Адрес', group: 'contacts' },
    { key: 'contacts.workingHours', value: contacts.workingHours, label: 'Режим работы', group: 'contacts' },
    
    // Компания
    { key: 'company.name', value: 'DanMax', label: 'Название компании', group: 'company' },
    { key: 'company.legalName', value: 'ООО ДанМакс', label: 'Юридическое название', group: 'company' },
    { key: 'company.inn', value: '', label: 'ИНН', group: 'company' },
    
    // Промо
    { key: 'promo.text', value: '', label: 'Текст промо-баннера', group: 'promo' },
    { key: 'promo.isActive', value: 'false', label: 'Активность промо', group: 'promo' },
    
    // Соцсети
    { key: 'social.vk', value: '', label: 'ВКонтакте', group: 'social' },
    { key: 'social.youtube', value: '', label: 'YouTube', group: 'social' },
    
    // Общие преимущества (home)
    ...whyUs.map((adv, index) => ({
      key: `home.advantage.${index}`,
      value: JSON.stringify({ title: adv.title, description: adv.description, icon: adv.icon }),
      label: `Преимущество ${index + 1}`,
      group: 'home',
    })),
    
    // Шаги работы (home)
    ...steps.map((step, index) => ({
      key: `home.step.${index}`,
      value: JSON.stringify({ 
        number: step.number, 
        title: step.title, 
        description: step.description, 
        icon: step.icon 
      }),
      label: `Шаг ${step.number}`,
      group: 'home',
    })),
    
    // Trust numbers (home)
    ...trustNumbers.map((tn, index) => ({
      key: `home.trustNumber.${index}`,
      value: JSON.stringify({ value: tn.value, suffix: tn.suffix, label: tn.label, icon: tn.icon }),
      label: `Факт ${index + 1}`,
      group: 'home',
    })),
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        label: setting.label,
        group: setting.group,
      },
    })
  }

  // ==================== БЛОГ ====================
  console.log('📰 Создание статей блога...')
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        author: post.author,
        readingTime: parseInt(post.readingTime) || null,
        tags: JSON.stringify(post.tags),
        isPublished: true,
        publishedAt: new Date(post.date),
        seoTitle: post.title,
        seoDescription: post.description,
      },
    })
  }

  console.log('✅ Seed-скрипт завершён успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed-скрипта:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
