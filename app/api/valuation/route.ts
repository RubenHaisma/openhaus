import { NextRequest, NextResponse } from 'next/server'
import { getPropertyData, calculateValuation } from '@/lib/kadaster'
import { realDataValidator } from '@/lib/real-data/validation'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const valuationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
})

export async function POST(request: NextRequest) {
  try {
    // Validate environment for real data APIs
    const envValidation = realDataValidator.validateEnvironment()
    if (!envValidation.valid) {
      Logger.error('Real data APIs not configured', new Error(envValidation.errors.join(', ')))
      return NextResponse.json(
        { 
          error: 'Real data services not available',
          details: envValidation.missing,
          message: 'Platform requires real government and financial data APIs'
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validatedData = valuationSchema.parse(body)

    // Validate inputs for real data calculation
    const inputValidation = realDataValidator.validateCalculationInputs({
      postalCode: validatedData.postalCode
    })
    
    if (!inputValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid input data', details: inputValidation.errors },
        { status: 400 }
      )
    }

    Logger.info('Starting real valuation calculation', {
      address: validatedData.address,
      postalCode: validatedData.postalCode
    })

    // Get REAL property data from Kadaster
    const propertyData = await getPropertyData(validatedData.address, validatedData.postalCode)
    if (!propertyData) {
      return NextResponse.json(
        { error: 'Property not found in Kadaster database' },
        { status: 404 }
      )
    }

    // Calculate REAL valuation using government and market data
    const valuation = await calculateValuation(propertyData)

    Logger.audit('Real valuation calculated', {
      address: validatedData.address,
      estimatedValue: valuation.estimatedValue,
      confidenceScore: valuation.confidenceScore,
      dataSource: valuation.realTimeData.dataSource
    })

    return NextResponse.json({
      property: propertyData,
      valuation,
      realData: true,
      timestamp: new Date().toISOString(),
      disclaimer: 'Valuation based on real government and market data'
    })

  } catch (error) {
    Logger.error('Real valuation calculation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    // Check if it's a real data API error
    if (error.message.includes('API') || error.message.includes('database')) {
      return NextResponse.json(
        { 
          error: 'Real data service unavailable',
          message: error.message,
          suggestion: 'Please try again later or contact support'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Valuation calculation failed', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for real data APIs
    const envValidation = realDataValidator.validateEnvironment()
    const apiStatus = await realDataValidator.testApiConnections()

    return NextResponse.json({
      environment: envValidation,
      apiConnections: apiStatus,
      realDataEnabled: envValidation.valid && apiStatus.failing.length === 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Real data health check failed', error as Error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}