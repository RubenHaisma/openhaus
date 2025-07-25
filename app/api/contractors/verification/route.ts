import { NextRequest, NextResponse } from 'next/server'
import { contractorVerificationService } from '@/lib/integrations/contractor-verification-real'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const verificationSchema = z.object({
  kvkNumber: z.string().regex(/^\d{8}$/, 'Valid KVK number required (8 digits)'),
})

const bulkVerificationSchema = z.object({
  kvkNumbers: z.array(z.string().regex(/^\d{8}$/, 'Valid KVK number required')).min(1).max(50),
})

const searchSchema = z.object({
  specialty: z.string().optional(),
  location: z.string().optional(),
  minQualityScore: z.number().min(0).max(100).optional(),
  certificationRequired: z.array(z.string()).optional(),
  maxDistance: z.number().min(5).max(100).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kvkNumber = searchParams.get('kvkNumber')

    if (kvkNumber) {
      // Single contractor verification
      const validation = verificationSchema.safeParse({ kvkNumber })
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
      }

      const verification = await contractorVerificationService.verifyContractor(kvkNumber)
      if (!verification) {
        return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
      }

      return NextResponse.json({ verification })
    }

    // Search verified contractors
    const searchCriteria = searchSchema.parse({
      specialty: searchParams.get('specialty'),
      location: searchParams.get('location'),
      minQualityScore: searchParams.get('minQualityScore') ? 
        parseInt(searchParams.get('minQualityScore')!) : undefined,
      certificationRequired: searchParams.get('certificationRequired')?.split(','),
      maxDistance: searchParams.get('maxDistance') ? 
        parseInt(searchParams.get('maxDistance')!) : undefined
    })

    const contractors = await contractorVerificationService.searchVerifiedContractors(searchCriteria)

    Logger.info('Contractor search performed', {
      criteria: searchCriteria,
      resultsCount: contractors.length
    })

    return NextResponse.json({
      contractors,
      total: contractors.length,
      searchCriteria,
      summary: {
        averageQualityScore: contractors.reduce((sum, c) => sum + c.qualityScore.overall, 0) / contractors.length,
        rvoVerifiedCount: contractors.filter(c => c.certifications.rvo.length > 0).length,
        lowRiskCount: contractors.filter(c => c.qualityScore.riskLevel === 'low').length
      }
    })
  } catch (error) {
    Logger.error('Contractor verification failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Contractor verification failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = bulkVerificationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { kvkNumbers } = validation.data

    Logger.info('Bulk contractor verification requested', {
      count: kvkNumbers.length,
      kvkNumbers: kvkNumbers.slice(0, 5) // Log first 5 for debugging
    })

    // Verify all contractors
    const verifications = await contractorVerificationService.bulkVerifyContractors(kvkNumbers)

    const summary = {
      total: kvkNumbers.length,
      verified: verifications.length,
      failed: kvkNumbers.length - verifications.length,
      averageQualityScore: verifications.reduce((sum, v) => sum + v.qualityScore.overall, 0) / verifications.length,
      rvoVerified: verifications.filter(v => v.certifications.rvo.length > 0).length,
      highQuality: verifications.filter(v => v.qualityScore.overall >= 80).length
    }

    Logger.audit('Bulk contractor verification completed', {
      ...summary,
      processingTime: Date.now()
    })

    return NextResponse.json({
      verifications,
      summary,
      recommendations: this.generateBulkRecommendations(verifications),
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Bulk contractor verification failed', error as Error)
    return NextResponse.json(
      { error: 'Bulk verification failed' },
      { status: 500 }
    )
  }
}

function generateBulkRecommendations(verifications: any[]): string[] {
  const recommendations = []

  const highQualityCount = verifications.filter(v => v.qualityScore.overall >= 80).length
  const lowRiskCount = verifications.filter(v => v.qualityScore.riskLevel === 'low').length

  if (highQualityCount >= 3) {
    recommendations.push(`${highQualityCount} hoogkwalitatieve installateurs gevonden`)
  }

  if (lowRiskCount >= 2) {
    recommendations.push(`${lowRiskCount} laagrisico installateurs beschikbaar`)
  }

  const rvoVerified = verifications.filter(v => v.certifications.rvo.length > 0).length
  if (rvoVerified > 0) {
    recommendations.push(`${rvoVerified} RVO-gecertificeerde installateurs`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Overweeg uitbreiding van zoekgebied voor meer opties')
  }

  return recommendations
}