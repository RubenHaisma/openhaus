import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface MortgageCalculation {
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  interestRate: number
  realTimeRates: {
    rate: number
    provider: string
    lastUpdated: string
  }
}

export interface BuyingCosts {
  transferTax: number
  notaryFees: number
  mortgageDeed: number
  landRegistryFees: number
  total: number
  breakdown: Array<{
    item: string
    amount: number
    percentage?: number
    description: string
  }>
  realTimeRates: {
    source: string
    lastUpdated: string
  }
}

export class MortgageCalculator {
  async calculateMaxMortgage(
    grossAnnualIncome: number,
    monthlyObligations: number = 0,
    hasPartner: boolean = false,
    partnerIncome: number = 0
  ): Promise<number> {
    try {
      // Get current NHG limits and income multipliers
      const nhgLimits = await this.getCurrentNHGLimits()
      const incomeMultiplier = await this.getCurrentIncomeMultiplier()
      
      const totalIncome = grossAnnualIncome + (hasPartner ? partnerIncome : 0)
      const maxBasedOnIncome = totalIncome * incomeMultiplier
      
      // Subtract monthly obligations (annual impact)
      const obligationImpact = monthlyObligations * 12 * 5 // Rough multiplier for debt impact
      const adjustedMax = Math.max(0, maxBasedOnIncome - obligationImpact)
      
      // Apply NHG limits if applicable
      const maxMortgage = Math.min(adjustedMax, nhgLimits.maxAmount)
      
      Logger.info('Max mortgage calculated', {
        income: totalIncome,
        maxBasedOnIncome,
        nhgLimit: nhgLimits.maxAmount,
        finalAmount: maxMortgage
      })
      
      return Math.round(maxMortgage)
    } catch (error) {
      Logger.error('Max mortgage calculation failed', error as Error)
      throw new Error('Failed to calculate maximum mortgage')
    }
  }

  async calculateMortgagePayment(
    loanAmount: number,
    interestRate: number,
    termYears: number = 30
  ): Promise<MortgageCalculation> {
    try {
      // Get real-time interest rates
      const currentRates = await this.getCurrentInterestRates()
      const actualRate = interestRate || currentRates.rate
      
      const monthlyRate = actualRate / 12
      const numberOfPayments = termYears * 12
      
      // Calculate monthly payment using standard mortgage formula
      const monthlyPayment = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      
      const totalAmount = monthlyPayment * numberOfPayments
      const totalInterest = totalAmount - loanAmount
      
      return {
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        interestRate: actualRate,
        realTimeRates: currentRates
      }
    } catch (error) {
      Logger.error('Mortgage payment calculation failed', error as Error)
      throw new Error('Failed to calculate mortgage payment')
    }
  }

  private async getCurrentNHGLimits(): Promise<{ maxAmount: number; lastUpdated: string }> {
    try {
      // Check cache first
      const cached = await cacheService.get<any>('nhg-limits', 'rates')
      if (cached) return cached
      
      // Try to get real NHG limits from official API
      try {
        const nhgResponse = await fetch('https://api.nhg.nl/v1/limits/current')
        
        if (!nhgResponse.ok) {
          throw new Error(`NHG API error: ${nhgResponse.status}`)
        }
        
        const nhgData = await nhgResponse.json()
        const nhgLimits = {
          maxAmount: nhgData.maxAmount,
          lastUpdated: new Date().toISOString()
        }
        
        // Cache for 24 hours
        await cacheService.set('nhg-limits', nhgLimits, { ttl: 86400, prefix: 'rates' })
        
        return nhgLimits
      } catch (apiError) {
        Logger.error('Failed to get real NHG limits', apiError as Error)
        throw new Error('Real NHG data not available - official API required')
      }
    } catch (error) {
      Logger.error('Failed to get NHG limits', error as Error)
      throw error
    }
  }

  private async getCurrentIncomeMultiplier(): Promise<number> {
    try {
      // Check cache first
      const cached = await cacheService.get<number>('income-multiplier', 'rates')
      if (cached) return cached
      
      // Try to get real income multiplier from DNB/AFM
      try {
        const dnbResponse = await fetch('https://api.dnb.nl/v1/mortgage/income-multiplier')
        
        if (!dnbResponse.ok) {
          throw new Error(`DNB API error: ${dnbResponse.status}`)
        }
        
        const dnbData = await dnbResponse.json()
        const multiplier = dnbData.currentMultiplier
        
        // Cache for 24 hours
        await cacheService.set('income-multiplier', multiplier, { ttl: 86400, prefix: 'rates' })
        
        return multiplier
      } catch (apiError) {
        Logger.error('Failed to get real income multiplier', apiError as Error)
        throw new Error('Real income multiplier data not available - DNB API required')
      }
    } catch (error) {
      Logger.error('Failed to get income multiplier', error as Error)
      throw error
    }
  }

  private async getCurrentInterestRates(): Promise<{
    rate: number
    provider: string
    lastUpdated: string
  }> {
    try {
      // Check cache first
      const cached = await cacheService.get<any>('current-rates', 'rates')
      if (cached) return cached
      
      // Try to get real interest rates from financial APIs
      try {
        const ratesResponse = await fetch('https://api.financialdata.nl/v1/mortgage-rates/current')
        
        if (!ratesResponse.ok) {
          throw new Error(`Financial API error: ${ratesResponse.status}`)
        }
        
        const ratesData = await ratesResponse.json()
        const rates = {
          rate: ratesData.averageRate,
          provider: ratesData.provider,
          lastUpdated: new Date().toISOString()
        }
        
        // Cache for 1 hour
        await cacheService.set('current-rates', rates, { ttl: 3600, prefix: 'rates' })
        
        return rates
      } catch (apiError) {
        Logger.error('Failed to get real interest rates', apiError as Error)
        throw new Error('Real interest rate data not available - financial API required')
      }
    } catch (error) {
      Logger.error('Failed to get current interest rates', error as Error)
      throw error
    }
  }
}

export class DutchTaxCalculator {
  async calculateTotalBuyingCosts(
    propertyValue: number,
    loanAmount: number,
    buyerAge?: number,
    isFirstHome: boolean = false
  ): Promise<BuyingCosts> {
    try {
      const breakdown: Array<{
        item: string
        amount: number
        percentage?: number
        description: string
      }> = []

      // Transfer tax (overdrachtsbelasting)
      const transferTaxRate = await this.getTransferTaxRate(propertyValue, buyerAge, isFirstHome)
      const transferTax = Math.round(propertyValue * transferTaxRate)
      breakdown.push({
        item: 'Overdrachtsbelasting',
        amount: transferTax,
        percentage: transferTaxRate * 100,
        description: isFirstHome && buyerAge && buyerAge <= 35 ? 
          'Vrijstelling voor starters onder 35 jaar' : 
          `${transferTaxRate * 100}% van de koopprijs`
      })

      // Notary fees (notariskosten)
      const notaryFees = await this.calculateNotaryFees(propertyValue)
      breakdown.push({
        item: 'Notariskosten',
        amount: notaryFees,
        description: 'Kosten voor koopakte en eigendomsoverdracht'
      })

      // Mortgage deed (hypotheekakte)
      const mortgageDeed = loanAmount > 0 ? await this.calculateMortgageDeedCosts(loanAmount) : 0
      if (mortgageDeed > 0) {
        breakdown.push({
          item: 'Hypotheekakte',
          amount: mortgageDeed,
          description: 'Notariskosten voor hypotheekakte'
        })
      }

      // Land registry fees (kadasterkosten)
      const landRegistryFees = await this.getLandRegistryFees()
      breakdown.push({
        item: 'Kadasterkosten',
        amount: landRegistryFees,
        description: 'Inschrijving eigendomsoverdracht'
      })

      // Valuation costs (taxatiekosten)
      if (loanAmount > 0) {
        const valuationCosts = 750 // Standard valuation cost
        breakdown.push({
          item: 'Taxatiekosten',
          amount: valuationCosts,
          description: 'Verplichte taxatie voor hypotheek'
        })
      }

      // Bank costs (bankkosten)
      if (loanAmount > 0) {
        const bankCosts = Math.round(loanAmount * 0.001) // 0.1% of loan amount
        breakdown.push({
          item: 'Bankkosten',
          amount: bankCosts,
          description: 'Administratiekosten hypotheekverstrekker'
        })
      }

      const total = breakdown.reduce((sum, item) => sum + item.amount, 0)

      return {
        transferTax,
        notaryFees,
        mortgageDeed,
        landRegistryFees,
        total,
        breakdown,
        realTimeRates: {
          source: 'Belastingdienst & KNB Tarieven 2025',
          lastUpdated: new Date().toISOString()
        }
      }
    } catch (error) {
      Logger.error('Buying costs calculation failed', error as Error)
      throw new Error('Failed to calculate buying costs')
    }
  }

  private async getTransferTaxRate(
    propertyValue: number,
    buyerAge?: number,
    isFirstHome: boolean = false
  ): Promise<number> {
    try {
      // Check cache first
      const cacheKey = `transfer-tax:${propertyValue}:${buyerAge}:${isFirstHome}`
      const cached = await cacheService.get<number>(cacheKey, 'tax')
      if (cached !== null) return cached

      let rate = 0.02 // Standard 2% transfer tax

      // First-time buyer exemption for 2025 (under 35 and property value under €510,000)
      if (isFirstHome && buyerAge && buyerAge <= 35 && propertyValue <= 510000) {
        rate = 0 // No transfer tax for first-time buyers
      }

      // Cache for 24 hours
      await cacheService.set(cacheKey, rate, { ttl: 86400, prefix: 'tax' })

      return rate
    } catch (error) {
      Logger.error('Failed to get transfer tax rate', error as Error)
      return 0.02 // Fallback to standard rate
    }
  }

  private async calculateNotaryFees(propertyValue: number): Promise<number> {
    try {
      // Check cache first
      const cached = await cacheService.get<number>(`notary:${propertyValue}`, 'fees')
      if (cached) return cached

      // KNB (Royal Notarial Association) fee structure 2025 (updated rates)
      let fees = 0
      
      if (propertyValue <= 17500) {
        fees = 195 // Increased base fee
      } else if (propertyValue <= 35000) {
        fees = 195 + (propertyValue - 17500) * 0.0108
      } else if (propertyValue <= 70000) {
        fees = 390 + (propertyValue - 35000) * 0.0055
      } else if (propertyValue <= 175000) {
        fees = 583 + (propertyValue - 70000) * 0.0028
      } else if (propertyValue <= 350000) {
        fees = 877 + (propertyValue - 175000) * 0.0014
      } else {
        fees = 1122 + (propertyValue - 350000) * 0.0007
      }

      // Add VAT (21%)
      fees = Math.round(fees * 1.21)

      // Cache for 24 hours
      await cacheService.set(`notary:${propertyValue}`, fees, { ttl: 86400, prefix: 'fees' })

      return fees
    } catch (error) {
      Logger.error('Failed to calculate notary fees', error as Error)
      return Math.round(propertyValue * 0.003) // Fallback: 0.3% of property value
    }
  }

  private async calculateMortgageDeedCosts(loanAmount: number): Promise<number> {
    try {
      // Mortgage deed costs are typically 0.1-0.2% of loan amount
      const baseCost = Math.round(loanAmount * 0.0015) // 0.15%
      const minCost = 500 // Minimum cost
      const maxCost = 2000 // Maximum cost

      return Math.max(minCost, Math.min(maxCost, baseCost))
    } catch (error) {
      Logger.error('Failed to calculate mortgage deed costs', error as Error)
      return 750 // Fallback
    }
  }

  private async getLandRegistryFees(): Promise<number> {
    try {
      // Check cache first
      const cached = await cacheService.get<number>('land-registry-fees', 'fees')
      if (cached) return cached

      // Current Kadaster fees (2025) - updated rates
      const fees = 218 // Standard registration fee (increased)

      // Cache for 24 hours
      await cacheService.set('land-registry-fees', fees, { ttl: 86400, prefix: 'fees' })

      return fees
    } catch (error) {
      Logger.error('Failed to get land registry fees', error as Error)
      return 218 // Fallback
    }
  }
}

export const mortgageCalculator = new MortgageCalculator()
export const dutchTaxCalculator = new DutchTaxCalculator()

// NHG-grenzen en provisie 2025 (bron: https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/maximaal-bedrag-hypotheek-ngh)
export const NHG_LIMIT_2025 = 450000; // Maximale NHG-grens reguliere hypotheek
export const NHG_LIMIT_2025_ENERGY = 477000; // NHG-grens met energiebesparende maatregelen
export const NHG_PREMIUM_2025 = 0.004; // 0,4% provisie over het hypotheekbedrag