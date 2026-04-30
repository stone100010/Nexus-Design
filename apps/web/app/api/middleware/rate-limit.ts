import { NextRequest, NextResponse } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100

export function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return null
  }

  record.count++

  if (record.count > MAX_REQUESTS) {
    return NextResponse.json(
      { success: false, error: '请求过于频繁，请稍后再试' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
        }
      }
    )
  }

  return null
}
