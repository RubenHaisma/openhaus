import winston from 'winston'
import * as Sentry from '@sentry/nextjs'

// Configure Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'openhaus-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export interface LogContext {
  userId?: string
  orderId?: string
  propertyId?: string
  transactionId?: string
  ipAddress?: string
  userAgent?: string
  [key: string]: any
}

export class Logger {
  static info(message: string, context?: LogContext): void {
    logger.info(message, context)
  }

  static warn(message: string, context?: LogContext): void {
    logger.warn(message, context)
    
    if (process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message,
        level: 'warning',
        data: context,
      })
    }
  }

  static error(message: string, error?: Error, context?: LogContext): void {
    logger.error(message, { error: error?.stack, ...context })
    
    if (process.env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (context) {
          Object.keys(context).forEach(key => {
            scope.setTag(key, context[key])
          })
        }
        
        if (error) {
          Sentry.captureException(error)
        } else {
          Sentry.captureMessage(message, 'error')
        }
      })
    }
  }

  static debug(message: string, context?: LogContext): void {
    logger.debug(message, context)
  }

  static audit(action: string, context: LogContext): void {
    logger.info(`AUDIT: ${action}`, {
      ...context,
      audit: true,
      timestamp: new Date().toISOString(),
    })
  }

  static security(event: string, context: LogContext): void {
    logger.warn(`SECURITY: ${event}`, {
      ...context,
      security: true,
      timestamp: new Date().toISOString(),
    })

    if (process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message: `Security Event: ${event}`,
        level: 'warning',
        category: 'security',
        data: context,
      })
    }
  }

  static performance(operation: string, duration: number, context?: LogContext): void {
    logger.info(`PERFORMANCE: ${operation} took ${duration}ms`, {
      ...context,
      performance: true,
      duration,
      operation,
    })
  }

  static transaction(type: string, amount: number, currency: string, context: LogContext): void {
    logger.info(`TRANSACTION: ${type} - ${amount} ${currency}`, {
      ...context,
      transaction: true,
      type,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    })
  }
}

// Performance monitoring middleware
export function performanceMiddleware(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - start
        Logger.performance(`${operation}.${propertyName}`, duration)
        return result
      } catch (error) {
        const duration = Date.now() - start
        Logger.error(`${operation}.${propertyName} failed after ${duration}ms`, error as Error)
        throw error
      }
    }

    return descriptor
  }
}

export { logger }