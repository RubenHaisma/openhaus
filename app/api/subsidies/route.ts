import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from RVO API and database
    // For now, return current 2024 subsidy schemes
    
    const subsidies = [
      {
        id: 'isde-2024',
        name: 'ISDE Subsidie 2024',
        provider: 'RVO',
        maxAmount: 7000,
        description: 'Subsidie voor duurzame energie in bestaande woningen',
        eligibilityCriteria: {
          propertyAge: 'Voor 2018',
          ownerOccupied: true,
          energyLabel: 'C of lager'
        },
        applicableEnergyMeasures: ['heat_pump', 'solar_boiler', 'biomass_boiler'],
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        isActive: true,
        applicationDeadline: '2024-12-31',
        budgetRemaining: 85, // percentage
        averageProcessingTime: 8 // weeks
      },
      {
        id: 'seeh-2024',
        name: 'SEEH Subsidie 2024',
        provider: 'RVO',
        maxAmount: 8000,
        description: 'Subsidie energiebesparende maatregelen eigen huis',
        eligibilityCriteria: {
          propertyAge: 'Voor 2018',
          ownerOccupied: true,
          incomeLimit: 43000
        },
        applicableEnergyMeasures: ['insulation', 'hr_glass', 'ventilation'],
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        isActive: true,
        applicationDeadline: '2024-12-31',
        budgetRemaining: 72,
        averageProcessingTime: 6
      },
      {
        id: 'bei-2024',
        name: 'BEI Subsidie 2024',
        provider: 'RVO',
        maxAmount: 25000,
        description: 'Subsidie voor energiebesparing in de industrie en MKB',
        eligibilityCriteria: {
          businessProperty: true,
          energySaving: 20 // minimum percentage
        },
        applicableEnergyMeasures: ['heat_pump', 'insulation', 'led_lighting', 'heat_recovery'],
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        isActive: true,
        applicationDeadline: '2024-12-31',
        budgetRemaining: 91,
        averageProcessingTime: 12
      },
      {
        id: 'municipal-amsterdam',
        name: 'Amsterdamse Energiesubsidie',
        provider: 'Gemeente Amsterdam',
        maxAmount: 5000,
        description: 'Aanvullende subsidie voor Amsterdamse woningeigenaren',
        eligibilityCriteria: {
          location: 'Amsterdam',
          propertyAge: 'Voor 2010',
          ownerOccupied: true
        },
        applicableEnergyMeasures: ['heat_pump', 'insulation', 'solar_panels'],
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        isActive: true,
        applicationDeadline: '2024-11-30',
        budgetRemaining: 45,
        averageProcessingTime: 4
      }
    ]

    // Add calculated fields
    const enrichedSubsidies = subsidies.map(subsidy => ({
      ...subsidy,
      popularity: subsidy.budgetRemaining < 50 ? 'high' : 
                 subsidy.budgetRemaining < 80 ? 'medium' : 'low',
      urgency: subsidy.budgetRemaining < 30 ? 'high' : 
               subsidy.budgetRemaining < 60 ? 'medium' : 'low'
    }))

    return NextResponse.json({
      subsidies: enrichedSubsidies,
      totalBudget: 3200000000, // €3.2 billion
      totalSchemes: subsidies.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Subsidies retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Subsidies retrieval failed' },
      { status: 500 }
    )
  }
}