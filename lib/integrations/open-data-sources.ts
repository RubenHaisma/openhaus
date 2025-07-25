/**
 * Centralized configuration for all open data sources
 * This file manages all external API endpoints and their configurations
 */

export const OPEN_DATA_SOURCES = {
    // Dutch Government Open Data
    CBS: {
      baseUrl: 'https://opendata.cbs.nl/ODataApi/odata',
      endpoints: {
        energyStatistics: '83989NED', // Energy statistics by region
        housingStatistics: '81955NED', // Housing statistics
        regionalData: '84583NED', // Regional energy data
        priceIndices: '83131NED' // Price indices
      },
      rateLimit: 1000, // requests per hour
      requiresAuth: false
    },
  
    // Energy Prices (Free APIs)
    ENERGY_PRICES: {
      // ANWB Energy prices (free, no auth required)
      anwbGas: 'https://energie.ljpc.nl/gas/anwb-energie-nu.txt',
      anwbElectricity: 'https://energie.ljpc.nl/stroom/anwb-energie-nu.txt',
      // Alternative: Energievergelijker API (free tier)
      energievergelijker: 'https://api.energievergelijker.nl/v1/prices',
      rateLimit: 100, // requests per hour
      requiresAuth: false
    },
  
    // Address and Geographic Data
    GEODATA: {
      // Dutch address lookup (free)
      pdokLocatieserver: 'https://api.pdok.nl/bzk/locatieserver/search/v3_1',
      // OpenStreetMap Nominatim (free)
      nominatim: 'https://nominatim.openstreetmap.org/search',
      // Overpass API for POI data (free)
      overpass: 'https://overpass-api.de/api/interpreter',
      rateLimit: 10000, // requests per day
      requiresAuth: false
    },
  
    // WOZ Data Sources
    WOZ: {
      // WOZ Waardeloket (scraping required)
      wozWaardeloket: 'https://www.wozwaardeloket.nl',
      // Alternative: Use CBS WOZ statistics
      cbsWozData: 'https://opendata.cbs.nl/ODataApi/odata/85066NED',
      rateLimit: 60, // requests per hour for scraping
      requiresAuth: false
    },
  
    // Energy Labels (EP Online - requires registration)
    ENERGY_LABELS: {
      // EP Online API (free registration required)
      epOnline: 'https://public.ep-online.nl/api/v5',
      // Alternative: Use building characteristics from BAG
      bagApi: 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2',
      rateLimit: 1000, // requests per day
      requiresAuth: true // Free registration required
    },
  
    // RVO Data (Government subsidies)
    RVO: {
      // RVO Open Data Portal
      openData: 'https://data.rvo.nl',
      // Subsidie API (if available)
      subsidieApi: 'https://api.rvo.nl/subsidies/v1',
      rateLimit: 500, // requests per hour
      requiresAuth: false // Open data, some endpoints may require registration
    },
  
    // Market Data
    MARKET_DATA: {
      // Funda API (limited free tier)
      funda: 'https://api.funda.nl/feeds/Aanbod.svc/json',
      // Alternative: Use CBS housing market data
      cbsHousingMarket: 'https://opendata.cbs.nl/ODataApi/odata/81955NED',
      rateLimit: 100, // requests per day
      requiresAuth: true // Registration required for Funda
    }
  } as const
  
  export const API_KEYS = {
    EP_ONLINE: process.env.EP_ONLINE_API_KEY,
    FUNDA: process.env.FUNDA_API_KEY,
    RVO: process.env.RVO_API_KEY,
  } as const
  
  export const RATE_LIMITS = {
    CBS: 1000, // per hour
    ENERGY_PRICES: 100, // per hour  
    GEODATA: 10000, // per day
    WOZ_SCRAPING: 60, // per hour
    EP_ONLINE: 1000, // per day
    RVO: 500, // per hour
    MARKET_DATA: 100 // per day
  } as const