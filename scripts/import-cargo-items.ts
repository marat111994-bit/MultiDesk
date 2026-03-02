import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Загрузка CargoItem из CSV...')

  // Сначала создаем категории
  console.log('📦 Создание категорий CargoCategory...')
  const categories = [
    { code: 'OSSG', name: 'Отходы строительства и ремонта' },
    { code: 'NO_OSSG', name: 'Неопасные отходы' },
    { code: 'INERT', name: 'Инертные отходы' },
    { code: 'SNOW', name: 'Снег' },
  ]

  for (const cat of categories) {
    await prisma.cargoCategory.upsert({
      where: { categoryCode: cat.code },
      update: {},
      create: {
        categoryCode: cat.code,
        name: cat.name,
      },
    })
  }
  console.log('✅ Категории созданы')

  const csvPath = path.join(__dirname, '../src/data/data/cargo_items.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let created = 0
  let skipped = 0

  for (const record of records as any[]) {
    const item_code: string = record.item_code
    const category_code: string = record.category_code
    const item_name: string = record.item_name
    const fkko_code: string = record.fkko_code
    const hazard_class: string = record.hazard_class

    // Пропускаем записи без fkko_code (они не нужны для поиска)
    if (!fkko_code || fkko_code.trim() === '') {
      skipped++
      continue
    }

    try {
      await prisma.cargoItem.upsert({
        where: { fkkoCode: fkko_code.trim() },
        update: {
          itemName: item_name.trim(),
          hazardClass: hazard_class ? parseInt(hazard_class, 10) : null,
        },
        create: {
          itemCode: item_code.trim(),
          categoryCode: category_code.trim(),
          itemName: item_name.trim(),
          fkkoCode: fkko_code.trim(),
          hazardClass: hazard_class ? parseInt(hazard_class, 10) : null,
        },
      })
      created++
      console.log(`✓ Добавлено: ${fkko_code} - ${item_name.substring(0, 50)}...`)
    } catch (error: any) {
      console.error(`✗ Ошибка для ${fkko_code}:`, error.message)
    }
  }

  console.log(`\n✅ Готово! Создано: ${created}, Пропущено: ${skipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
