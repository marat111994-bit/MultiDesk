import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Проверка авторизации для API-роутов админки
 * Возвращает токен или null если не авторизован
 */
export async function requireAuth(request: NextRequest): Promise<string | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return null
  }

  return token.id as string
}

/**
 * Проверка авторизации для API-роутов админки
 * Если не авторизован - возвращает 401 Unauthorized
 * 
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await checkAuth(request)
 *   if (!auth.authenticated) {
 *     return auth.response
 *   }
 *   // продолжение логики...
 * }
 */
export async function checkAuth(request: NextRequest): Promise<{
  authenticated: boolean
  response: NextResponse | null
  userId: string | null
}> {
  const userId = await requireAuth(request)

  if (!userId) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
    }
  }

  return {
    authenticated: true,
    response: null,
    userId,
  }
}
