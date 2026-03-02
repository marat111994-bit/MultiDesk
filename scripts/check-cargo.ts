import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Проверка CargoItem...')
  
  const count = await prisma.cargoItem.count()
  console.log(`📦 Всего записей CargoItem: ${count}`)
  
  const items = await prisma.cargoItem.findMany({
    take: 5,
    select: {
      id: true,
      itemCode: true,
      categoryCode: true,
      itemName: true,
      fkkoCode: true,
      hazardClass: true,
    },
  })
  
  console.log('\n📋 Первые 5 записей:')
  items.forEach(item => {
    console.log(`  - ${item.fkkoCode || item.itemCode}: ${item.itemName.substring(0, 50)}...`)
  })
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
