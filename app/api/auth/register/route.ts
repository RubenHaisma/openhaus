import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/security/auth'
import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['buyer', 'seller']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await cacheService.rateLimitCheck(
      `register:${clientIP}`, 
      5, // 5 attempts
      3600 // per hour
    )
    
    if (!rateLimitResult.allowed) {
      Logger.security('Registration rate limit exceeded', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent'),
      })
      
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Register user
    const result = await authService.register(validatedData)

    Logger.audit('User registered', {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent'),
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
    Logger.error('Registration failed', error as Error, {
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}