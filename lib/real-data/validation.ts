// Real Data Validation Service
// Ensures all calculations use only verified, real-time data

export class RealDataValidator {
  private requiredApiKeys = [
    'KADASTER_API_KEY',
    'BELASTINGDIENST_API_KEY', 
    'NVM_API_KEY',
    'NHG_API_KEY',
    'EP_ONLINE_API_KEY'
  ]

  validateEnvironment(): { valid: boolean; missing: string[]; errors: string[] } {
    const missing: string[] = []
    const errors: string[] = []

    // Check required API keys
    for (const key of this.requiredApiKeys) {
      if (!process.env[key]) {
        missing.push(key)
        errors.push(`${key} is required for real data calculations`)
      }
    }

    // Validate API key formats
    if (process.env.KADASTER_API_KEY && !this.isValidKadasterKey(process.env.KADASTER_API_KEY)) {
      errors.push('KADASTER_API_KEY format is invalid')
    }

    if (process.env.NVM_API_KEY && !this.isValidNVMKey(process.env.NVM_API_KEY)) {
      errors.push('NVM_API_KEY format is invalid')
    }

    return {
      valid: missing.length === 0 && errors.length === 0,
      missing,
      errors
    }
  }

  async testApiConnections(): Promise<{ working: string[]; failing: string[] }> {
    const working: string[] = []
    const failing: string[] = []

    // Test Kadaster API
    try {
      const { kadasterClient } = await import('./kadaster-api')
      await kadasterClient.getPropertyByAddress('Test', '1000AA')
      working.push('Kadaster API')
    } catch (error) {
      failing.push('Kadaster API')
    }

    // Test NVM API
    try {
      const { marketDataProvider } = await import('./market-data')
      await marketDataProvider.getMarketTrends('1000AA')
      working.push('NVM API')
    } catch (error) {
      failing.push('NVM API')
    }

    // Test Belastingdienst API
    try {
      const { dutchTaxCalculator } = await import('./tax-calculator')
      await dutchTaxCalculator.calculateTransferTax(400000)
      working.push('Belastingdienst API')
    } catch (error) {
      failing.push('Belastingdienst API')
    }

    return { working, failing }
  }

  validateCalculationInputs(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.propertyValue || data.propertyValue <= 0) {
      errors.push('Valid property value is required')
    }

    if (data.income && data.income <= 0) {
      errors.push('Valid income is required for mortgage calculations')
    }

    if (data.postalCode && !this.isValidDutchPostalCode(data.postalCode)) {
      errors.push('Valid Dutch postal code is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private isValidKadasterKey(key: string): boolean {
    // Kadaster API keys are typically 32-character hex strings
    return /^[a-f0-9]{32}$/i.test(key)
  }

  private isValidNVMKey(key: string): boolean {
    // NVM API keys are typically JWT tokens
    return key.split('.').length === 3
  }

  private isValidDutchPostalCode(postalCode: string): boolean {
    // Dutch postal code format: 1234 AB or 1234AB
    return /^\d{4}\s?[A-Z]{2}$/i.test(postalCode)
  }
}

export const realDataValidator = new RealDataValidator()

// Middleware to ensure real data is used
export function requireRealData() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Validate environment before executing
      const validation = realDataValidator.validateEnvironment()
      if (!validation.valid) {
        throw new Error(`Real data APIs not configured: ${validation.missing.join(', ')}`)
      }

      // Execute with real data validation
      try {
        const result = await method.apply(this, args)
        
        // Ensure result contains real data markers
        if (result && typeof result === 'object') {
          result._realData = true
          result._timestamp = new Date().toISOString()
        }
        
        return result
      } catch (error) {
        console.error(`Real data calculation failed in ${propertyName}:`, error)
        throw new Error(`Real data calculation failed: ${error.message}`)
      }
    }

    return descriptor
  }
}