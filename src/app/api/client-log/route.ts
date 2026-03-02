import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  logger.warn('CLIENT: ' + body.message, {
    url: body.url,
    data: body.data,
    stack: body.stack || null
  })
  return NextResponse.json({ ok: true })
}
