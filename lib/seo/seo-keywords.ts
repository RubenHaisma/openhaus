// SEO keyword mapping for OpenHaus platform

export const primaryKeywords = {
    // High-volume selling keywords
    selling: [
      'huis verkopen zonder makelaar',
      'woning verkopen particulier', 
      'huis verkopen zelf',
      'makelaarskosten besparen',
      'particuliere verkoop woning',
      'huis verkopen direct',
      'woning verkopen zonder commissie'
    ],
    
    // High-volume buying keywords
    buying: [
      'huis kopen particulier',
      'woning kopen zonder makelaar',
      'huis kopen direct van eigenaar',
      'particuliere verkoop kopen',
      'huis kopen zonder commissie'
    ],
    
    // Valuation keywords
    valuation: [
      'woningtaxatie gratis',
      'huis taxeren online',
      'waarde woning berekenen',
      'gratis woningwaardering',
      'woz waarde opzoeken',
      'huis schatten waarde'
    ],
    
    // Mortgage keywords
    mortgage: [
      'hypotheek berekenen',
      'hypotheek calculator',
      'maximale hypotheek berekenen',
      'hypotheek rente vergelijken',
      'hypotheekadvies'
    ],
    
    // Location-based keywords
    locations: [
      'huis verkopen amsterdam',
      'woning kopen rotterdam', 
      'huis verkopen utrecht',
      'woning kopen den haag',
      'huis verkopen eindhoven',
      'particuliere verkoop amsterdam'
    ]
  }
  
  export const longTailKeywords = {
    selling: [
      'huis verkopen zonder makelaar amsterdam',
      'woning verkopen particulier rotterdam',
      'kosten huis verkopen zonder makelaar',
      'hoe verkoop je een huis zonder makelaar',
      'huis verkopen zelf stappen',
      'particuliere verkoop woning nederland',
      'huis verkopen zonder makelaarskosten 2024'
    ],
    
    buying: [
      'huis kopen particulier amsterdam',
      'woning kopen zonder makelaar rotterdam',
      'particuliere verkoop huizen nederland',
      'huis kopen direct van eigenaar',
      'voordelen huis kopen zonder makelaar'
    ],
    
    process: [
      'notaris kiezen bij huis verkopen',
      'documenten nodig huis verkopen',
      'koopovereenkomst zonder makelaar',
      'bezichtiging organiseren zelf',
      'onderhandelen huis verkopen tips'
    ]
  }
  
  export const semanticKeywords = {
    // Related terms that support main keywords
    realEstate: [
      'vastgoed',
      'onroerend goed',
      'eigendom',
      'koopwoning',
      'eengezinswoning',
      'appartement',
      'rijtjeshuis'
    ],
    
    process: [
      'verkoop',
      'aankoop', 
      'overdracht',
      'eigendomsoverdracht',
      'koopakte',
      'notaris',
      'kadaster',
      'hypotheek'
    ],
    
    financial: [
      'koopprijs',
      'marktwaarde',
      'woz waarde',
      'taxatie',
      'financiering',
      'bod',
      'onderhandeling'
    ]
  }
  
  export const competitorKeywords = {
    // Keywords competitors rank for that we should target
    funda: [
      'huizen te koop',
      'woningen te koop nederland',
      'huis zoeken',
      'woning zoeken'
    ],
    
    jaap: [
      'huis kopen',
      'woning kopen',
      'vastgoed nederland'
    ],
    
    makelaars: [
      'makelaar',
      'makelaardij',
      'vastgoedmakelaar',
      'nvm makelaar'
    ]
  }
  
  // Keyword difficulty and search volume estimates
  export const keywordMetrics = {
    'huis verkopen zonder makelaar': {
      volume: 2400,
      difficulty: 'medium',
      intent: 'commercial'
    },
    'woning kopen particulier': {
      volume: 1900,
      difficulty: 'medium',
      intent: 'commercial'
    },
    'woningtaxatie gratis': {
      volume: 3200,
      difficulty: 'low',
      intent: 'informational'
    },
    'hypotheek berekenen': {
      volume: 8100,
      difficulty: 'high',
      intent: 'commercial'
    },
    'makelaarskosten besparen': {
      volume: 880,
      difficulty: 'low',
      intent: 'commercial'
    }
  }
  
  // City-specific keyword templates
  export const cityKeywordTemplates = [
    'huis verkopen {city}',
    'woning kopen {city}',
    'huizen te koop {city}',
    'woningtaxatie {city}',
    'makelaar {city}',
    'vastgoed {city}',
    'particuliere verkoop {city}'
  ]
  
  // Property type keyword templates  
  export const propertyTypeKeywords = [
    'eengezinswoning verkopen',
    'appartement verkopen',
    'rijtjeshuis verkopen',
    'villa verkopen',
    'penthouse verkopen',
    'studio verkopen'
  ]
  
  export function generateCityKeywords(city: string): string[] {
    return cityKeywordTemplates.map(template => 
      template.replace('{city}', city.toLowerCase())
    )
  }
  
  export function generatePropertyTypeKeywords(propertyType: string): string[] {
    return [
      `${propertyType} verkopen zonder makelaar`,
      `${propertyType} kopen particulier`,
      `${propertyType} te koop`,
      `${propertyType} taxatie`,
      `${propertyType} waarde`
    ]
  }