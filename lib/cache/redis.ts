import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

export class CacheService {
  private defaultTTL = 3600 // 1 hour

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key
      const value = await redis.get(fullKey)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = options.prefix ? `${options.prefix}:${key}` : key
      const ttl = options.ttl || this.defaultTTL
      
      await redis.setex(fullKey, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key
      await redis.del(fullKey)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key
      const result = await redis.exists(fullKey)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  async increment(key: string, prefix?: string): Promise<number> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key
      return await redis.incr(fullKey)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key
      await redis.expire(fullKey, ttl)
      return true
    } catch (error) {
      console.error('Cache expire error:', error)
      return false
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Cache flush pattern error:', error)
      return false
    }
  }

  // Specialized caching methods
  async cachePropertyData(propertyId: string, data: any, ttl: number = 1800): Promise<void> {
    await this.set(propertyId, data, { prefix: 'property', ttl })
  }

  async getCachedPropertyData(propertyId: string): Promise<any> {
    return await this.get(propertyId, 'property')
  }

  async cacheUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    await this.set(userId, sessionData, { prefix: 'session', ttl })
  }

  async getCachedUserSession(userId: string): Promise<any> {
    return await this.get(userId, 'session')
  }

  async cacheSearchResults(query: string, results: any, ttl: number = 600): Promise<void> {
    const queryHash = Buffer.from(query).toString('base64')
    await this.set(queryHash, results, { prefix: 'search', ttl })
  }

  async getCachedSearchResults(query: string): Promise<any> {
    const queryHash = Buffer.from(query).toString('base64')
    return await this.get(queryHash, 'search')
  }

  async rateLimitCheck(identifier: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const key = `ratelimit:${identifier}`
      const current = await this.increment(key, '')
      
      if (current === 1) {
        await this.expire(key, window, '')
      }

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current)
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, remaining: limit }
    }
  }
}

export const cacheService = new CacheService()

// Cache decorator
export function cached(ttl: number = 3600, prefix?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`
      
      // Try to get from cache first
      const cached = await cacheService.get(cacheKey, prefix)
      if (cached !== null) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      await cacheService.set(cacheKey, result, { ttl, prefix })
      
      return result
    }

    return descriptor
  }
}