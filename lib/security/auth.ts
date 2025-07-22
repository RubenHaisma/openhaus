import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

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
  role?: 'buyer' | 'seller'
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
  private readonly ACCESS_TOKEN_EXPIRY = '15m'
  private readonly REFRESH_TOKEN_EXPIRY = '7d'

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single()

      if (existingUser) {
        throw new Error('User already exists')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12)

      // Create user
      const { data: user, error } = await supabase
        .from('profiles')
        .insert({
          email: data.email,
          name: data.name,
          password_hash: hashedPassword,
          role: data.role || 'buyer',
          verified: false,
        })
        .select()
        .single()

      if (error) throw error

      // Generate verification token
      const verificationToken = this.generateVerificationToken()
      await this.storeVerificationToken(user.id, verificationToken)

      // Send verification email
      const { emailService } = await import('../integrations/email')
      await emailService.sendEmail({
        to: user.email,
        subject: 'Verifieer je account - OpenHaus',
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
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', credentials.email)
        .single()

      if (error || !user) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
      if (!isValidPassword) {
        throw new Error('Invalid credentials')
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new Error('Account is temporarily locked')
      }

      // Reset failed login attempts on successful login
      if (user.failed_login_attempts > 0) {
        await supabase
          .from('profiles')
          .update({
            failed_login_attempts: 0,
            locked_until: null,
          })
          .eq('id', user.id)
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

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
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.userId)
        .single()

      if (error || !user) {
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
      const { data: tokenData, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'email_verification')
        .single()

      if (error || !tokenData) {
        throw new Error('Invalid verification token')
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Verification token expired')
      }

      // Update user as verified
      await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('id', tokenData.user_id)

      // Delete verification token
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('id', tokenData.id)

      return true
    } catch (error) {
      console.error('Email verification failed:', error)
      return false
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Get user
      const { data: user, error } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', email)
        .single()

      if (error || !user) {
        // Don't reveal if email exists
        return true
      }

      // Generate reset token
      const resetToken = this.generateVerificationToken()
      await this.storeVerificationToken(user.id, resetToken, 'password_reset')

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
      const { data: tokenData, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'password_reset')
        .single()

      if (error || !tokenData) {
        throw new Error('Invalid reset token')
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Reset token expired')
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update user password
      await supabase
        .from('profiles')
        .update({ 
          password_hash: hashedPassword,
          failed_login_attempts: 0,
          locked_until: null,
        })
        .eq('id', tokenData.user_id)

      // Delete reset token
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('id', tokenData.id)

      return true
    } catch (error) {
      console.error('Password reset failed:', error)
      return false
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.userId)
        .single()

      if (error || !user) {
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
    type: string = 'email_verification'
  ): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours

    await supabase
      .from('verification_tokens')
      .insert({
        user_id: userId,
        token,
        type,
        expires_at: expiresAt.toISOString(),
      })
  }

  private async handleFailedLogin(email: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('profiles')
        .select('id, failed_login_attempts')
        .eq('email', email)
        .single()

      if (user) {
        const attempts = (user.failed_login_attempts || 0) + 1
        const updateData: any = { failed_login_attempts: attempts }

        // Lock account after 5 failed attempts
        if (attempts >= 5) {
          const lockUntil = new Date()
          lockUntil.setMinutes(lockUntil.getMinutes() + 30) // 30 minutes
          updateData.locked_until = lockUntil.toISOString()
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
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
      createdAt: user.created_at,
    }
  }
}

export const authService = new AuthService()