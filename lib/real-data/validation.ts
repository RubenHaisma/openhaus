import { Logger } from '@/lib/monitoring/logger'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  missing?: string[]
}

export class RealDataValidator {
  validateEnvironment(): ValidationResult {
    const required = [
      'DATABASE_URL',
      'REDIS_HOST',
      'NEXT_PUBLIC_APP_URL'
    ]

    const missing = required.filter(key => !process.env[key])

    return {
      valid: missing.length === 0,
      errors: missing.map(key => `Missing environment variable: ${key}`),
      missing
    }
  }

  validateCalculationInputs(data: {
    propertyValue: number
    income: number
  }): ValidationResult {
    const errors: string[] = []

    // Property value validation
    if (data.propertyValue < 50000) {
      errors.push('Property value too low (minimum €50,000)')
    }
    if (data.propertyValue > 5000000) {
      errors.push('Property value too high (maximum €5,000,000)')
    }

    // Income validation
    if (data.income < 20000) {
      errors.push('Income too low for mortgage calculation (minimum €20,000)')
    }
    if (data.income > 1000000) {
      errors.push('Income too high for standard calculation (maximum €1,000,000)')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  validateDutchPostalCode(postalCode: string): ValidationResult {
    const pattern = /^\d{4}\s?[A-Z]{2}$/i
    const isValid = pattern.test(postalCode)

    return {
      valid: isValid,
      errors: isValid ? [] : ['Invalid Dutch postal code format (expected: 1234AB)']
    }
  }

  validateDutchAddress(address: string): ValidationResult {
    const errors: string[] = []

    if (address.length < 5) {
      errors.push('Address too short')
    }

    if (address.length > 100) {
      errors.push('Address too long')
    }

    // Check for house number
    if (!/\d+/.test(address)) {
      errors.push('Address must contain a house number')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  validateWOZValue(wozValue: number): ValidationResult {
    const errors: string[] = []

    if (wozValue < 10000) {
      errors.push('WOZ value too low (minimum €10,000)')
    }

    if (wozValue > 10000000) {
      errors.push('WOZ value too high (maximum €10,000,000)')
    }

    // Check if WOZ value is reasonable (not obviously wrong)
    const currentYear = new Date().getFullYear()
    const minReasonableValue = 50000
    const maxReasonableValue = 3000000

    if (wozValue < minReasonableValue || wozValue > maxReasonableValue) {
      errors.push(`WOZ value outside reasonable range (€${minReasonableValue.toLocaleString()} - €${maxReasonableValue.toLocaleString()})`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export const realDataValidator = new RealDataValidator()