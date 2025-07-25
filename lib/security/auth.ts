import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { Role, VerificationType } from '@prisma/client'

export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
  verified: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: Role
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
  private readonly ACCESS_TOKEN_EXPIRY = '15m'
  private readonly REFRESH_TOKEN_EXPIRY = '7d'

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.profile.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        throw new Error('User already exists')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12)

      // Create user
      const user = await prisma.profile.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: hashedPassword,
          role: data.role || Role.HOMEOWNER,
          verified: false
        }
      })

      // Generate verification token
      const verificationToken = this.generateVerificationToken()
      await this.storeVerificationToken(user.id, verificationToken)

      // Send verification email
      const { emailService } = await import('../integrations/email')
      await emailService.sendEmail({
        to: user.email,
        subject: 'Verifieer je account - WattVrij',
        templateId: 'email-verification-template',
        dynamicTemplateData: {
          name: user.name,
          verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
        },
      })

      // Generate tokens
      const tokens = await this.generateTokens(user)

      return {
        user: this.sanitizeUser(user),
        tokens,
      }
    } catch (error) {
      console.error('Registration failed:', error)
      throw new Error('Registration failed')
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Get user with password
      const user = await prisma.profile.findUnique({
        where: { email: credentials.email }
      })

      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash || '')
      if (!isValidPassword) {
        throw new Error('Invalid credentials')
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new Error('Account is temporarily locked')
      }

      // Reset failed login attempts on successful login
      if (user.failedLoginAttempts > 0) {
        await prisma.profile.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null
          }
        })
      }

      // Update last login
      await prisma.profile.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      // Generate tokens
      const tokens = await this.generateTokens(user)

      return {
        user: this.sanitizeUser(user),
        tokens,
      }
    } catch (error) {
      // Handle failed login attempts
      await this.handleFailedLogin(credentials.email)
      console.error('Login failed:', error)
      throw error
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any
      
      // Get user
      const user = await prisma.profile.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw new Error('Invalid refresh token')
      }

      // Generate new tokens
      return await this.generateTokens(user)
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw new Error('Token refresh failed')
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Get verification token
      const tokenData = await prisma.verificationToken.findUnique({
        where: { 
          token,
          type: VerificationType.EMAIL_VERIFICATION
        }
      })

      if (!tokenData) {
        throw new Error('Invalid verification token')
      }

      // Check if token is expired
      if (new Date(tokenData.expiresAt) < new Date()) {
        throw new Error('Verification token expired')
      }

      // Update user as verified
      await prisma.profile.update({
        where: { id: tokenData.userId },
        data: { verified: true }
      })

      // Delete verification token
      await prisma.verificationToken.delete({
        where: { id: tokenData.id }
      })

      return true
    } catch (error) {
      console.error('Email verification failed:', error)
      return false
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Get user
      const user = await prisma.profile.findUnique({
        where: { email },
        select: { id: true, email: true, name: true }
      })

      if (!user) {
        // Don't reveal if email exists
        return true
      }

      // Generate reset token
      const resetToken = this.generateVerificationToken()
      await this.storeVerificationToken(user.id, resetToken, VerificationType.PASSWORD_RESET)

      // Send reset email
      const { emailService } = await import('../integrations/email')
      await emailService.sendPasswordReset(user.email, resetToken)

      return true
    } catch (error) {
      console.error('Password reset request failed:', error)
      return false
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Get reset token
      const tokenData = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: VerificationType.PASSWORD_RESET
        }
      })

      if (!tokenData) {
        throw new Error('Invalid reset token')
      }

      // Check if token is expired
      if (new Date(tokenData.expiresAt) < new Date()) {
        throw new Error('Reset token expired')
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update user password
      await prisma.profile.update({
        where: { id: tokenData.userId },
        data: {
          passwordHash: hashedPassword,
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      })

      // Delete reset token
      await prisma.verificationToken.delete({
        where: { id: tokenData.id }
      })

      return true
    } catch (error) {
      console.error('Password reset failed:', error)
      return false
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      
      const user = await prisma.profile.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        return null
      }

      return this.sanitizeUser(user)
    } catch (error) {
      return null
    }
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    })

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private async storeVerificationToken(
    userId: string, 
    token: string, 
    type: VerificationType = VerificationType.EMAIL_VERIFICATION
  ): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours

    await prisma.verificationToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt
      }
    })
  }

  private async handleFailedLogin(email: string): Promise<void> {
    try {
      const user = await prisma.profile.findUnique({
        where: { email },
        select: { id: true, failedLoginAttempts: true }
      })

      if (user) {
        const attempts = (user.failedLoginAttempts || 0) + 1
        const updateData: any = { failedLoginAttempts: attempts }

        // Lock account after 5 failed attempts
        if (attempts >= 5) {
          const lockUntil = new Date()
          lockUntil.setMinutes(lockUntil.getMinutes() + 30) // 30 minutes
          updateData.lockedUntil = lockUntil
        }

        await prisma.profile.update({
          where: { id: user.id },
          data: updateData
        })
      }
    } catch (error) {
      console.error('Failed login handling error:', error)
    }
  }

  private sanitizeUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt.toISOString()
    }
  }
}

export const authService = new AuthService()