import { prisma } from './prisma'

interface LogActivityParams {
  userId: string
  action: 'created' | 'updated' | 'deleted'
  entity: string
  entityId?: string
  details?: Record<string, any>
}

export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  details,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

export async function getActivityLogs(limit = 10) {
  return prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
