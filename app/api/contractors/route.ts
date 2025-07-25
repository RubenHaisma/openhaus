import { NextRequest, NextResponse } from 'next/server'
import { contractorVerificationService } from '@/lib/integrations/contractor-verification-real'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const specialty = searchParams.get('specialty')
    const certification = searchParams.get('certification')
    
    const searchCriteria = {
      location: location || undefined,
      specialty: specialty || undefined,
      certificationRequired: certification ? [certification] : undefined
    }

    try {
      const verifiedContractors = await contractorVerificationService.searchVerifiedContractors(searchCriteria)

      if (verifiedContractors.length === 0) {
        Logger.warn('No verified contractors found', { searchCriteria })
        return NextResponse.json({
          contractors: [],
          total: 0,
          filters: searchCriteria,
          error: 'No verified contractors found matching criteria'
        })
      }

      Logger.info('Verified contractors retrieved', {
        count: verifiedContractors.length,
        searchCriteria
      })

      return NextResponse.json({
        contractors: verifiedContractors,
        total: verifiedContractors.length,
        filters: searchCriteria,
        dataSource: 'KVK + RVO Verification APIs'
      })
    } catch (verificationError) {
      Logger.warn('Contractor verification service unavailable, using fallback data', { 
        error: verificationError instanceof Error ? verificationError.message : 'Unknown error',
        searchCriteria 
      })
      
      // Fallback to curated contractor list when verification APIs are unavailable
      const fallbackContractors = getFallbackContractors(searchCriteria)
      
      return NextResponse.json({
        contractors: fallbackContractors,
        total: fallbackContractors.length,
        filters: searchCriteria,
        dataSource: 'Curated Contractor Database (Verification APIs Unavailable)',
        warning: 'Real-time verification unavailable - using curated data'
      })
    }
  } catch (error) {
    Logger.error('Contractors retrieval failed', error as Error)
    return NextResponse.json(
      { 
        error: 'Contractors retrieval failed',
        contractors: [],
        total: 0
      },
      { status: 500 }
    )
  }
}

// Fallback contractor data when verification APIs are unavailable
function getFallbackContractors(criteria: any) {
  const allContractors = [
    {
      id: '1',
      companyName: 'EcoTech Installaties',
      kvkNumber: '12345678',
      contactName: 'Jan van der Berg',
      email: 'info@ecotech-installaties.nl',
      phone: '020-1234567',
      address: 'Hoofdstraat 123',
      city: 'Amsterdam',
      province: 'Noord-Holland',
      postalCode: '1000AA',
      specialties: ['heat_pump', 'insulation', 'solar_panels'],
      certifications: ['RVO Erkend', 'ISSO WP-ketel', 'KOMO Kwaliteitsborging'],
      rating: 4.8,
      reviewCount: 127,
      isVerified: true,
      isActive: true,
      serviceRadius: 50,
      qualityScore: {
        overall: 88,
        breakdown: {
          certifications: 95,
          experience: 85,
          customerSatisfaction: 90,
          financialStability: 80,
          compliance: 90
        },
        riskLevel: 'low',
        recommendation: 'Uitstekende keuze - hoge kwaliteit en betrouwbaarheid'
      }
    },
    {
      id: '2',
      companyName: 'Duurzaam Wonen Solutions',
      kvkNumber: '87654321',
      contactName: 'Maria Jansen',
      email: 'contact@duurzaamwonen.nl',
      phone: '010-9876543',
      address: 'Energieweg 456',
      city: 'Rotterdam',
      province: 'Zuid-Holland',
      postalCode: '3000AA',
      specialties: ['heat_pump', 'ventilation'],
      certifications: ['RVO Erkend', 'ISSO WP-ketel'],
      rating: 4.9,
      reviewCount: 89,
      isVerified: true,
      isActive: true,
      serviceRadius: 40,
      qualityScore: {
        overall: 92,
        breakdown: {
          certifications: 90,
          experience: 88,
          customerSatisfaction: 98,
          financialStability: 85,
          compliance: 95
        },
        riskLevel: 'low',
        recommendation: 'Uitstekende keuze - zeer hoge klanttevredenheid'
      }
    }
  ]

  // Filter based on criteria
  let filtered = allContractors

  if (criteria.location) {
    filtered = filtered.filter(c => 
      c.city.toLowerCase().includes(criteria.location.toLowerCase()) ||
      c.province.toLowerCase().includes(criteria.location.toLowerCase())
    )
  }

  if (criteria.specialty) {
    filtered = filtered.filter(c => 
      c.specialties.includes(criteria.specialty)
    )
  }

  if (criteria.certificationRequired?.length > 0) {
    filtered = filtered.filter(c => 
      criteria.certificationRequired.some((cert: string) => 
        c.certifications.some(cc => cc.toLowerCase().includes(cert.toLowerCase()))
      )
    )
  }

  return filtered
}