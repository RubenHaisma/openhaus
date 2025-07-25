import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const specialty = searchParams.get('specialty')
    const certification = searchParams.get('certification')
    
    // In production, this would query the contractors database
    // For now, return mock certified contractors
    
    const contractors = [
      {
        id: '1',
        companyName: 'GreenTech Installaties',
        contactName: 'Jan van der Berg',
        email: 'info@greentech.nl',
        phone: '020-1234567',
        address: 'Hoofdstraat 123',
        city: 'Amsterdam',
        province: 'Noord-Holland',
        postalCode: '1000AB',
        specialties: ['heat_pumps', 'solar_panels', 'insulation'],
        certifications: {
          rvo: {
            certified: true,
            number: 'RVO-2024-001',
            validUntil: '2025-12-31'
          },
          isso: {
            certified: true,
            number: 'ISSO-WP-2024-001',
            validUntil: '2025-12-31'
          },
          komo: {
            certified: true,
            number: 'KOMO-2024-001',
            validUntil: '2025-12-31'
          }
        },
        rating: 4.8,
        reviewCount: 127,
        isVerified: true,
        isActive: true,
        serviceRadius: 50,
        completedProjects: 450,
        averageProjectValue: 15000,
        description: 'Specialist in duurzame energieoplossingen voor woningen. Meer dan 10 jaar ervaring met warmtepompen en zonnepanelen.',
        founded: 2012,
        employees: 15,
        insuranceAmount: 2500000,
        warrantyPeriod: 5
      },
      {
        id: '2',
        companyName: 'EcoWarm Installateurs',
        contactName: 'Maria Jansen',
        email: 'contact@ecowarm.nl',
        phone: '010-9876543',
        address: 'Energieweg 45',
        city: 'Rotterdam',
        province: 'Zuid-Holland',
        postalCode: '3000CD',
        specialties: ['heat_pumps', 'ventilation'],
        certifications: {
          rvo: {
            certified: true,
            number: 'RVO-2024-002',
            validUntil: '2025-12-31'
          },
          isso: {
            certified: true,
            number: 'ISSO-WP-2024-002',
            validUntil: '2025-12-31'
          }
        },
        rating: 4.9,
        reviewCount: 89,
        isVerified: true,
        isActive: true,
        serviceRadius: 75,
        completedProjects: 320,
        averageProjectValue: 18000,
        description: 'Gespecialiseerd in warmtepompen en ventilatie systemen. Kwaliteit en klanttevredenheid staan voorop.',
        founded: 2015,
        employees: 12,
        insuranceAmount: 2000000,
        warrantyPeriod: 7
      },
      {
        id: '3',
        companyName: 'Isolatie Experts Utrecht',
        contactName: 'Peter de Vries',
        email: 'info@isolatie-experts.nl',
        phone: '030-5555666',
        address: 'Isolatiestraat 78',
        city: 'Utrecht',
        province: 'Utrecht',
        postalCode: '3500EF',
        specialties: ['insulation', 'renovation'],
        certifications: {
          rvo: {
            certified: true,
            number: 'RVO-2024-003',
            validUntil: '2025-12-31'
          },
          komo: {
            certified: true,
            number: 'KOMO-2024-003',
            validUntil: '2025-12-31'
          }
        },
        rating: 4.7,
        reviewCount: 156,
        isVerified: true,
        isActive: true,
        serviceRadius: 60,
        completedProjects: 280,
        averageProjectValue: 12000,
        description: 'Specialist in isolatie en energetische renovaties. Persoonlijke aanpak en vakmanschap.',
        founded: 2010,
        employees: 8,
        insuranceAmount: 1500000,
        warrantyPeriod: 10
      }
    ]

    // Filter contractors based on search parameters
    let filteredContractors = contractors

    if (location) {
      filteredContractors = filteredContractors.filter(contractor =>
        contractor.city.toLowerCase().includes(location.toLowerCase()) ||
        contractor.province.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (specialty) {
      filteredContractors = filteredContractors.filter(contractor =>
        contractor.specialties.includes(specialty)
      )
    }

    if (certification === 'RVO') {
      filteredContractors = filteredContractors.filter(contractor =>
        contractor.certifications.rvo.certified
      )
    }

    return NextResponse.json({
      contractors: filteredContractors,
      total: filteredContractors.length,
      filters: {
        location,
        specialty,
        certification
      }
    })
  } catch (error) {
    Logger.error('Contractors retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Contractors retrieval failed' },
      { status: 500 }
    )
  }
}