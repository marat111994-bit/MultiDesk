import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/orders
 * Возвращает объединённые заявки из двух источников:
 * - FormSubmission (заявки с сайта)
 * - Calculation (заявки калькулятора)
 * 
 * Query params:
 * - type: 'all' | 'site' | 'calculator'
 * - status: фильтр по статусу
 * - search: поиск по имени/компании
 * - dateFrom: дата от (YYYY-MM-DD)
 * - dateTo: дата до (YYYY-MM-DD)
 * - limit: количество записей (по умолчанию 20)
 * - offset: смещение (по умолчанию 0)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all' // 'all' | 'site' | 'calculator'
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Построение условий для даты
    const dateFilter: any = {}
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      dateFilter.lte = toDate
    }

    // Получаем заявки с сайта (FormSubmission)
    let siteOrders: any[] = []
    let siteTotal = 0

    if (type === 'all' || type === 'site') {
      const siteWhere: any = {}
      
      if (Object.keys(dateFilter).length > 0) {
        siteWhere.createdAt = dateFilter
      }

      // Для site статусы: new (непрочитано), read (прочитано), archived (архив)
      if (status) {
        if (status === 'new') siteWhere.isRead = false
        else if (status === 'read') siteWhere.isRead = true
        else if (status === 'archived') siteWhere.isArchived = true
      }

      // Поиск по имени
      if (search) {
        siteWhere.OR = [
          { name: { contains: search } },
          { phone: { contains: search } },
        ]
      }

      const [submissions, total] = await Promise.all([
        prisma.formSubmission.findMany({
          where: siteWhere,
          orderBy: { createdAt: 'desc' },
          take: type === 'site' ? limit : undefined,
          skip: type === 'site' ? offset : undefined,
        }),
        prisma.formSubmission.count({ where: siteWhere }),
      ])

      siteOrders = submissions.map((s) => ({
        id: `site-${s.id}`,
        source: 'site' as const,
        date: s.createdAt.toISOString(),
        contactName: s.name,
        companyName: null,
        type: s.serviceType || 'Контактная форма',
        totalPrice: null,
        status: s.isArchived ? 'archived' : s.isRead ? 'read' : 'new',
        rawId: s.id,
        phone: s.phone,
        comment: s.comment,
        sourceName: s.name,
      }))

      siteTotal = total
    }

    // Получаем заявки калькулятора (Calculation)
    let calculatorOrders: any[] = []
    let calculatorTotal = 0

    if (type === 'all' || type === 'calculator') {
      const calcWhere: any = {}

      if (Object.keys(dateFilter).length > 0) {
        calcWhere.createdAt = dateFilter
      }

      // Для calculator статусы: draft, sent, completed, cancelled
      if (status && status !== 'new' && status !== 'read' && status !== 'archived') {
        calcWhere.status = status
      }

      // Поиск по имени компании, контакту, ID
      if (search) {
        calcWhere.OR = [
          { companyName: { contains: search } },
          { contactName: { contains: search } },
          { calculationId: { contains: search } },
          { cargoName: { contains: search } },
        ]
      }

      const [calculations, total] = await Promise.all([
        prisma.calculation.findMany({
          where: calcWhere,
          orderBy: { createdAt: 'desc' },
          take: type === 'calculator' ? limit : undefined,
          skip: type === 'calculator' ? offset : undefined,
        }),
        prisma.calculation.count({ where: calcWhere }),
      ])

      calculatorOrders = calculations.map((c) => ({
        id: `calc-${c.id}`,
        source: 'calculator' as const,
        date: c.createdAt.toISOString(),
        contactName: c.contactName || '',
        companyName: c.companyName,
        type: getServiceTypeName(c.serviceType),
        totalPrice: c.totalPrice,
        status: c.status,
        rawId: c.id,
        calculationId: c.calculationId,
        cargoName: c.cargoName,
        sourceName: c.companyName || c.contactName || '',
      }))

      calculatorTotal = total
    }

    // Объединяем и сортируем по дате
    let allOrders = [...siteOrders, ...calculatorOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const total = siteTotal + calculatorTotal

    // Применяем пагинацию для типа 'all'
    if (type === 'all') {
      allOrders = allOrders.slice(offset, offset + limit)
    }

    return NextResponse.json({
      data: allOrders,
      pagination: {
        total,
        siteTotal,
        calculatorTotal,
        limit,
        offset,
        hasMore: offset + allOrders.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching unified orders:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заявок' },
      { status: 500 }
    )
  }
}

function getServiceTypeName(serviceType: string): string {
  const types: Record<string, string> = {
    transport: 'Перевозка',
    transport_disposal_auto: 'Перевозка + утилизация (авто)',
    transport_disposal_manual: 'Перевозка + утилизация (ручной)',
  }
  return types[serviceType] || serviceType
}
