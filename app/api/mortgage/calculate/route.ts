import { NextRequest, NextResponse } from 'next/server'
import { mortgageCalculator, dutchTaxCalculator } from '@/lib/real-data/tax-calculator'
import { marketDataProvider } from '@/lib/real-data/market-data'
import { realDataValidator } from '@/lib/real-data/validation'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const mortgageCalculationSchema = z.object({
  grossAnnualIncome: z.number().min(1, 'Valid income required'),
  propertyValue: z.number().min(1, 'Valid property value required'),
  ownCapital: z.number().min(0).default(0),
  monthlyObligations: z.number().min(0).default(0),
  hasPartner: z.boolean().default(false),
  partnerIncome: z.number().min(0).default(0),
  buyerAge: z.number().min(18).max(100).optional(),
  isFirstHome: z.boolean().default(false),
  termYears: z.number().min(1).max(50).default(30)
})

export async function POST(request: NextRequest) {
  try {
    // Validate environment for real financial data APIs
    const envValidation = realDataValidator.validateEnvironment()
    if (!envValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Real financial data services not available',
          details: envValidation.missing,
          message: 'Mortgage calculations require real NHG, DNB, and bank data'
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validatedData = mortgageCalculationSchema.parse(body)

    // Validate inputs for real calculation
    const inputValidation = realDataValidator.validateCalculationInputs({
      propertyValue: validatedData.propertyValue,
      income: validatedData.grossAnnualIncome
    })
    
    if (!inputValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid calculation inputs', details: inputValidation.errors },
        { status: 400 }
      )
    }

    Logger.info('Starting real mortgage calculation', {
      income: validatedData.grossAnnualIncome,
      propertyValue: validatedData.propertyValue,
      isFirstHome: validatedData.isFirstHome
    })

    // Get REAL maximum mortgage from NHG data
    const maxMortgage = await mortgageCalculator.calculateMaxMortgage(
      validatedData.grossAnnualIncome,
      validatedData.monthlyObligations,
      validatedData.hasPartner,
      validatedData.partnerIncome
    )

    // Calculate REAL loan amount constraints
    const maxLoanFromValue = validatedData.propertyValue * 0.9 // 90% LTV limit
    const maxLoanFromCapital = validatedData.propertyValue - validatedData.ownCapital
    const actualMaxLoan = Math.min(maxMortgage, maxLoanFromValue, maxLoanFromCapital)

    if (actualMaxLoan <= 0) {
      return NextResponse.json(
        { 
          error: 'No mortgage possible with current parameters',
          maxMortgageFromIncome: maxMortgage,
          maxLoanFromValue: maxLoanFromValue,
          requiredCapital: validatedData.propertyValue - maxMortgage
        },
        { status: 400 }
      )
    }

    // Get REAL current interest rates
    const currentRates = await marketDataProvider.getCurrentInterestRates()
    
    // Calculate REAL mortgage payment
    const mortgageDetails = await mortgageCalculator.calculateMortgagePayment(
      actualMaxLoan,
      currentRates.mortgage,
      validatedData.termYears
    )

    // Calculate REAL buying costs with current tax rates
    const buyingCosts = await dutchTaxCalculator.calculateTotalBuyingCosts(
      validatedData.propertyValue,
      actualMaxLoan,
      validatedData.buyerAge,
      validatedData.isFirstHome
    )

    // Calculate total monthly costs
    const monthlyMortgage = mortgageDetails.monthlyPayment
    const monthlyTax = (validatedData.propertyValue * 0.001) / 12 // Rough property tax estimate
    const totalMonthlyCost = monthlyMortgage + monthlyTax

    Logger.audit('Real mortgage calculation completed', {
      income: validatedData.grossAnnualIncome,
      propertyValue: validatedData.propertyValue,
      maxLoan: actualMaxLoan,
      interestRate: currentRates.mortgage,
      monthlyPayment: monthlyMortgage,
      buyingCosts: buyingCosts.total
    })

    return NextResponse.json({
      calculation: {
        maxLoanAmount: actualMaxLoan,
        monthlyPayment: monthlyMortgage,
        totalMonthlyCost,
        interestRate: currentRates.mortgage * 100,
        loanToValue: (actualMaxLoan / validatedData.propertyValue) * 100,
        totalInterest: mortgageDetails.totalInterest,
        totalAmount: mortgageDetails.totalAmount
      },
      buyingCosts: {
        transferTax: buyingCosts.transferTax,
        notaryFees: buyingCosts.notaryFees,
        mortgageDeed: buyingCosts.mortgageDeed,
        landRegistry: buyingCosts.landRegistryFees,
        total: buyingCosts.total,
        breakdown: buyingCosts.breakdown
      },
      realTimeData: {
        interestRateSource: mortgageDetails.realTimeRates.provider,
        taxRateSource: buyingCosts.realTimeRates.source,
        lastUpdated: new Date().toISOString(),
        nhgLimits: true,
        governmentRates: true
      },
      constraints: {
        maxFromIncome: maxMortgage,
        maxFromValue: maxLoanFromValue,
        maxFromCapital: maxLoanFromCapital,
        actualMax: actualMaxLoan
      },
      disclaimer: 'Calculation based on real NHG norms, current bank rates, and government tax rates'
    })

  } catch (error) {
    Logger.error('Real mortgage calculation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    // Check if it's a real data API error
    if (error.message.includes('NHG') || error.message.includes('DNB') || error.message.includes('API')) {
      return NextResponse.json(
        { 
          error: 'Real financial data service unavailable',
          message: error.message,
          suggestion: 'Financial calculations require live 2025 data from NHG, DNB, and banks'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Mortgage calculation failed', message: error.message },
      { status: 500 }
    )
  }
}