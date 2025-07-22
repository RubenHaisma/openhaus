import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/security/auth'
import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await cacheService.rateLimitCheck(
      `login:${clientIP}`, 
      10, // 10 attempts
      900 // per 15 minutes
    )
    
    if (!rateLimitResult.allowed) {
      Logger.security('Login rate limit exceeded', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent'),
        email: body.email,
      })
      
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Login user
    const result = await authService.login(validatedData)

    Logger.audit('User logged in', {
      userId: result.user.id,
      email: result.user.email,
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
    })

    // Cache user session
    await cacheService.cacheUserSession(result.user.id, {
      email: result.user.email,
      role: result.user.role,
      lastActivity: new Date().toISOString(),
    })

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    })

    response.cookies.set('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    Logger.error('Login failed', error as Error, {
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      email: body?.email,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}