import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Импортируем данные из статических файлов
import { vyvozGrunta } from '../src/data/services/vyvoz-grunta'
import { betonnyjBoj } from '../src/data/services/betonnyj-boj'
import { asfaltnyjBoj } from '../src/data/services/asfaltnyj-boj'
import { smeshannyeOthody } from '../src/data/services/smeshannye-othody'
import { razreshitelnayaDokumentaciya } from '../src/data/services/razreshitelnaya-dokumentaciya'
import { kirpichnyjBoj } from '../src/data/services/kirpichnyj-boj'

const servicesData = [
  vyvozGrunta,
  betonnyjBoj,
  asfaltnyjBoj,
  smeshannyeOthody,
  razreshitelnayaDokumentaciya,
  kirpichnyjBoj,
]

async function main() {
  console.log('Начинаем перенос данных в базу...')

  for (const serviceData of servicesData) {
    console.log(`Обработка услуги: ${serviceData.slug}`)

    // Проверяем, существует ли услуга
    const existing = await prisma.service.findUnique({
      where: { slug: serviceData.slug },
    })

    if (existing) {
      console.log(`  Обновление услуги ${serviceData.slug}...`)
      
      await prisma.service.update({
        where: { slug: serviceData.slug },
        data: {
          title: serviceData.title,
          shortTitle: serviceData.shortTitle,
          description: serviceData.description,
          shortDescription: serviceData.shortDescription,
          heroImage: serviceData.heroImage,
          heroImageAlt: serviceData.heroImageAlt,
          topBadge: serviceData.topBadge,
          badges: JSON.stringify(serviceData.badges),
          trustNumbers: JSON.stringify(serviceData.trustNumbers),
          seoTitle: serviceData.seo.title,
          seoDescription: serviceData.seo.description,
          seoH1: serviceData.seo.h1,
          seoKeywords: JSON.stringify(serviceData.seo.keywords),
        },
      })

      // Обновляем подкатегории
      for (const sub of serviceData.subcategories) {
        const existingSub = await prisma.subcategory.findUnique({
          where: { slug: sub.slug },
        })

        if (existingSub) {
          await prisma.subcategory.update({
            where: { slug: sub.slug },
            data: {
              title: sub.title,
              shortTitle: sub.shortTitle,
              description: sub.description,
              shortDescription: sub.shortDescription,
              heroImage: sub.heroImage,
              heroImageAlt: sub.heroImageAlt,
              topBadge: sub.topBadge,
              badges: JSON.stringify(sub.badges),
              trustNumbers: JSON.stringify(sub.trustNumbers),
              seoTitle: sub.seo.title,
              seoDescription: sub.seo.description,
              seoH1: sub.seo.h1,
              seoKeywords: JSON.stringify(sub.seo.keywords),
            },
          })
          console.log(`    Подкатегория ${sub.slug} обновлена`)
        }
      }

      console.log(`  Услуга ${serviceData.slug} обновлена`)
    } else {
      console.log(`  Создание услуги ${serviceData.slug}...`)
      
      await prisma.service.create({
        data: {
          slug: serviceData.slug,
          title: serviceData.title,
          shortTitle: serviceData.shortTitle,
          description: serviceData.description,
          shortDescription: serviceData.shortDescription,
          heroImage: serviceData.heroImage,
          heroImageAlt: serviceData.heroImageAlt,
          topBadge: serviceData.topBadge,
          badges: JSON.stringify(serviceData.badges),
          trustNumbers: JSON.stringify(serviceData.trustNumbers),
          seoTitle: serviceData.seo.title,
          seoDescription: serviceData.seo.description,
          seoH1: serviceData.seo.h1,
          seoKeywords: JSON.stringify(serviceData.seo.keywords),
          isActive: true,
        },
      })

      console.log(`  Услуга ${serviceData.slug} создана`)
    }
  }

  console.log('Готово!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
