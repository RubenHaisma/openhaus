import puppeteer, { Browser } from 'puppeteer'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { productionWozScraper, type ScrapingResult as ProductionScrapingResult } from './woz-scraper-production'

export interface WOZData {
  address: string
  postalCode: string
  wozValue: number
  referenceYear: number
  objectType: string
  surfaceArea?: number
  scrapedAt: string
  sourceUrl: string
  // Additional fields from WOZ scraping
  grondOppervlakte?: string
  bouwjaar?: string
  gebruiksdoel?: string
  oppervlakte?: string
  identificatie?: string
  adresseerbaarObject?: string
  nummeraanduiding?: string
  wozValues?: Array<{ date: string, value: string }>
}

export interface ScrapingResult {
  success: boolean
  data?: WOZData
  error?: string
  cached?: boolean
}

export class WOZScraper {
  private baseUrl = 'https://www.wozwaardeloket.nl'
  private browser: Browser | null = null
  private static instance: WOZScraper
  private browserPromise: Promise<Browser> | null = null

  static getInstance(): WOZScraper {
    if (!WOZScraper.instance) {
      WOZScraper.instance = new WOZScraper()
    }
    return WOZScraper.instance
  }
  async initBrowser(): Promise<void> {
    if (!this.browser && !this.browserPromise) {
      try {
        // Skip browser initialization in production
        if (process.env.NODE_ENV === 'production') {
          Logger.warn('Skipping Puppeteer browser initialization in production')
          return
        }

        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
        const isDevelopment = process.env.NODE_ENV === 'development';
  
        // Log environment details for debugging
        Logger.info('Attempting to launch Puppeteer browser', {
          nodeVersion: process.version,
          puppeteerVersion: require('puppeteer/package.json').version,
          executablePath: executablePath || 'default',
          env: isDevelopment ? 'development' : 'production',
        });
  
        this.browserPromise = puppeteer.launch({
          headless: true,
          executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
          timeout: isDevelopment ? 60000 : 30000, // Longer timeout in dev
          // Add environment variable to skip Chromium download in dev if needed
          ignoreDefaultArgs: isDevelopment && process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ? ['--disable-extensions'] : [],
        });
  
        this.browser = await this.browserPromise;
        Logger.info('Browser launched successfully', { executablePath });
      } catch (err) {
        Logger.error('Failed to launch Puppeteer browser', err as Error, {
          env: process.env.NODE_ENV,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'default',
          message: (err as Error).message,
          stack: (err as Error).stack,
        });
        console.log('Puppeteer launch error details:', {
          message: (err as Error).message,
          stack: (err as Error).stack,
        });
  
        // Additional diagnostics for development
        if (process.env.NODE_ENV === 'development') {
          console.error('Puppeteer launch error details:', {
            message: (err as Error).message,
            stack: (err as Error).stack,
          });
          // Suggest common fixes
          console.error(
            'Try these steps:\n' +
            '1. Install Chromium: `npx puppeteer browsers install chrome`\n' +
            '2. Set PUPPETEER_EXECUTABLE_PATH in .env to your Chrome/Chromium binary\n' +
            '3. Ensure system dependencies are installed (e.g., libx11-dev, libxkbcommon, libgtk-3-0)\n' +
            '4. Check for sufficient disk space and permissions'
          );
        }
  
        this.browserPromise = null;
        this.browser = null;
        throw new Error(`Browser initialization failed: ${(err as Error).message}`);
      }
      this.browserPromise = null;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async getWOZValue(address: string, postalCode: string): Promise<ScrapingResult> {
    try {
      // ALWAYS use production scraper - no Puppeteer in production
      Logger.info('Using production WOZ scraper (real data only)', { address, postalCode })
      const result = await productionWozScraper.getWOZValue(address, postalCode)
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        cached: result.cached
      }

    } catch (error) {
      Logger.error('WOZ scraping failed - NO MOCK DATA FALLBACK', error as Error, {
        address,
        postalCode
      })

      return {
        success: false,
        error: `WOZ scraping failed: ${error instanceof Error ? error.message : 'Unknown scraping error'}`
      }
    }
  }

  private parseWOZValue(text: string): number | null {
    if (!text) return null

    // Find all potential WOZ values in the text
    const wozPatterns = [
      /€\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*euro/gi,
      /(\d{1,3}(?:[.,]\d{3})*)\s*(?:euro|€)/gi,
      /woz[^€\d]*€?\s*(\d{1,3}(?:[.,]\d{3})*)/gi,
      /waarde[^€\d]*€?\s*(\d{1,3}(?:[.,]\d{3})*)/gi
    ]
    
    const potentialValues: number[] = []
    
    for (const pattern of wozPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const value = this.normalizeNumber(match[1])
        if (value && value >= 50000 && value <= 5000000) { // Reasonable WOZ value range
          potentialValues.push(value)
        }
      }
    }
    
    // Return the most likely WOZ value (highest value in reasonable range)
    if (potentialValues.length > 0) {
      return Math.max(...potentialValues)
    }
    
    // Fallback to original parsing
    const cleanText = text.replace(/[^\d.,]/g, '')
    
    // Handle different number formats
    const numberMatch = cleanText.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/)
    if (!numberMatch) return null

    return this.normalizeNumber(numberMatch[1])
  }
  
  private normalizeNumber(numberStr: string): number | null {
    if (!numberStr) return null
    
    // Convert European number format to standard format
    if (numberStr.includes(',') && numberStr.includes('.')) {
      // Format like 123.456,78 or 123,456.78
      if (numberStr.lastIndexOf(',') > numberStr.lastIndexOf('.')) {
        // European format: 123.456,78
        numberStr = numberStr.replace(/\./g, '').replace(',', '.')
      } else {
        // US format: 123,456.78
        numberStr = numberStr.replace(/,/g, '')
      }
    } else if (numberStr.includes(',')) {
      // Could be thousands separator or decimal
      const parts = numberStr.split(',')
      if (parts.length === 2 && parts[1].length <= 2) {
        // Decimal separator: 123,45
        numberStr = numberStr.replace(',', '.')
      } else {
        // Thousands separator: 123,456
        numberStr = numberStr.replace(/,/g, '')
      }
    } else if (numberStr.includes('.')) {
      // Could be thousands separator or decimal
      const parts = numberStr.split('.')
      if (parts.length === 2 && parts[1].length <= 2) {
        // Decimal separator: 123.45
        // Keep as is
      } else {
        // Thousands separator: 123.456
        numberStr = numberStr.replace(/\./g, '')
      }
    }

    const value = parseFloat(numberStr)
    return isNaN(value) ? null : Math.round(value)
  }

  private parseYear(text: string): number | null {
    if (!text) return null
    const yearMatch = text.match(/(20\d{2})/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  private parseSurfaceArea(text: string): number | null {
    if (!text) return null
    const areaMatch = text.match(/(\d+(?:[.,]\d+)?)[ ]*m[²2]?/)
    if (!areaMatch) return null
    return parseFloat(areaMatch[1].replace(',', '.'))
  }

  private async getCachedWOZData(address: string, postalCode: string): Promise<WOZData | null> {
    try {
      const data = await prisma.wozCache.findFirst({
        where: {
          address,
          postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
          scrapedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days cache for faster updates
          }
        },
        orderBy: {
          scrapedAt: 'desc'
        }
      })

      if (!data) return null

      return {
        address: data.address,
        postalCode: data.postalCode,
        wozValue: data.wozValue,
        referenceYear: data.referenceYear,
        objectType: data.objectType,
        surfaceArea: data.surfaceArea ? Number(data.surfaceArea) : undefined,
        scrapedAt: data.scrapedAt.toISOString(),
        sourceUrl: data.sourceUrl,
        // Include additional fields if they exist in database
        grondOppervlakte: (data as any).grondOppervlakte,
        bouwjaar: (data as any).bouwjaar,
        gebruiksdoel: (data as any).gebruiksdoel,
        oppervlakte: (data as any).oppervlakte,
        identificatie: (data as any).identificatie,
        adresseerbaarObject: (data as any).adresseerbaarObject,
        nummeraanduiding: (data as any).nummeraanduiding,
        wozValues: (data as any).wozValues
      }
    } catch (error) {
      Logger.error('Failed to retrieve cached WOZ data', error as Error)
      return null
    }
  }

  private async cacheWOZData(data: WOZData): Promise<void> {
    try {
      await prisma.wozCache.upsert({
        where: {
          address_postalCode: {
            address: data.address,
            postalCode: data.postalCode
          }
        },
        update: {
          wozValue: data.wozValue,
          referenceYear: data.referenceYear,
          objectType: data.objectType,
          surfaceArea: data.surfaceArea,
          scrapedAt: new Date(data.scrapedAt),
          sourceUrl: data.sourceUrl,
          updatedAt: new Date(),
          // Store additional WOZ fields as JSON
          metadata: {
            grondOppervlakte: data.grondOppervlakte,
            bouwjaar: data.bouwjaar,
            gebruiksdoel: data.gebruiksdoel,
            oppervlakte: data.oppervlakte,
            identificatie: data.identificatie,
            adresseerbaarObject: data.adresseerbaarObject,
            nummeraanduiding: data.nummeraanduiding,
            wozValues: data.wozValues
          }
        },
        create: {
          address: data.address,
          postalCode: data.postalCode,
          wozValue: data.wozValue,
          referenceYear: data.referenceYear,
          objectType: data.objectType,
          surfaceArea: data.surfaceArea,
          scrapedAt: new Date(data.scrapedAt),
          sourceUrl: data.sourceUrl,
          // Store additional WOZ fields as JSON
          metadata: {
            grondOppervlakte: data.grondOppervlakte,
            bouwjaar: data.bouwjaar,
            gebruiksdoel: data.gebruiksdoel,
            oppervlakte: data.oppervlakte,
            identificatie: data.identificatie,
            adresseerbaarObject: data.adresseerbaarObject,
            nummeraanduiding: data.nummeraanduiding,
            wozValues: data.wozValues
          }
        }
        })

    } catch (error) {
      Logger.error('Failed to cache WOZ data', error as Error)
    }
  }

  async cleanup(): Promise<void> {
    await this.closeBrowser()
  }
  
  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      return await productionWozScraper.healthCheck()
    } catch (error) {
      return false
    }
  }
}

export const wozScraper = WOZScraper.getInstance()

// Cleanup on process exit
process.on('exit', () => {
  wozScraper.cleanup()
})

process.on('SIGINT', () => {
  wozScraper.cleanup()
  process.exit()
})

process.on('SIGTERM', () => {
  wozScraper.cleanup()
  process.exit()
})