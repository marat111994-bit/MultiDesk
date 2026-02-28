// Скрипт для принудительной ревалидации страниц
// Запуск: node scripts/revalidate.js

async function revalidatePage(path) {
  const res = await fetch('http://localhost:3000/api/admin/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  
  if (res.ok) {
    console.log(`✅ Ревилидировано: ${path}`)
  } else {
    console.error(`❌ Ошибка: ${path}`)
  }
}

// Ревилидируем все страницы услуг
async function main() {
  const services = [
    '/uslugi/vyvoz-grunta',
    '/uslugi/kirpichnyj-boj',
    '/uslugi/betonnyj-boj',
    '/uslugi/asfaltnyj-boj',
    '/uslugi/smeshannye-stroitelnye-othody',
    '/uslugi/razreshitelnaya-dokumentaciya',
  ]
  
  for (const path of services) {
    await revalidatePage(path)
  }
  
  console.log('Готово!')
}

main()
