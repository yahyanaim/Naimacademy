import { NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIp = req.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  return "127.0.0.1"
}

export function rateLimit(
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
) {
  return (req: NextRequest): NextResponse | null => {
    const ip = getClientIp(req)
    const now = Date.now()
    const key = `${ip}:${req.nextUrl.pathname}`

    const current = rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return null
    }

    if (current.count >= config.maxRequests) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000)
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(current.resetTime),
          },
        }
      )
    }

    current.count++
    rateLimitStore.set(key, current)

    return null
  }
}

const strictRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 30,
})

const mediumRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 60,
})

const authRateLimit = rateLimit({
  windowMs: 900000,
  maxRequests: 10,
})

export function getRateLimiter(type: "strict" | "medium" | "auth" | "default") {
  switch (type) {
    case "strict":
      return strictRateLimit
    case "medium":
      return mediumRateLimit
    case "auth":
      return authRateLimit
    default:
      return mediumRateLimit
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)
