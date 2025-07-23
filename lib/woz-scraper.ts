import puppeteer from 'puppeteer'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

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
  private browser: puppeteer.Browser | null = null
  private static instance: WOZScraper
  private browserPromise: Promise<puppeteer.Browser> | null = null

  static getInstance(): WOZScraper {
    if (!WOZScraper.instance) {
      WOZScraper.instance = new WOZScraper()
    }
    return WOZScraper.instance
  }
  async initBrowser(): Promise<void> {
    if (!this.browser && !this.browserPromise) {
      this.browserPromise = puppeteer.launch({
        headless: true,
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
          '--disable-renderer-backgrounding'
        ]
      })
      this.browser = await this.browserPromise
      this.browserPromise = null
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
      // Create cache key
      const cacheKey = `woz:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      
      // Check Redis cache first (faster than database)
      const cachedData = await cacheService.get<WOZData>(cacheKey, 'woz')
      if (cachedData) {
        Logger.info('WOZ data retrieved from Redis cache', { address, postalCode: postalCode.replace(/\s/g, '').toUpperCase() })
        return {
          success: true,
          data: cachedData,
          cached: true
        }
      }

      // First check if we have cached data
      const cachedWOZData = await this.getCachedWOZData(address, postalCode)
      if (cachedWOZData) {
        Logger.info('WOZ data retrieved from cache', { address, postalCode: postalCode.replace(/\s/g, '').toUpperCase() })
        // Store in Redis for faster future access
        await cacheService.set(cacheKey, cachedWOZData, { ttl: 86400, prefix: 'woz' }) // 24 hours
        return {
          success: true,
          data: cachedWOZData,
          cached: true
        }
      }

      // Initialize browser if needed
      await this.initBrowser()
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser')
      }

      const page = await this.browser.newPage()
      
      // Optimize page for speed
      await page.setRequestInterception(true)
      page.on('request', (req: any) => {
        // Block unnecessary resources for faster loading
        if (req.resourceType() === 'stylesheet' || 
            req.resourceType() === 'font' ||
            req.resourceType() === 'image' ||
            req.resourceType() === 'media') {
          req.abort()
        } else {
          req.continue()
        }
      })
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1280, height: 720 })
      
      // Navigate to WOZ website
      await page.goto(this.baseUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      })

      // Wait for the new search input to load
      await page.waitForSelector('#ggcSearchInput', { timeout: 10000 })

      // Type the full address (e.g., "Kampweg 10, 3769DG") into the search input
      const fullAddress = `${address}, ${postalCode.replace(/\s/g, '').toUpperCase()}`
      await page.type('#ggcSearchInput', fullAddress)

      // Wait for the suggestion list to appear and have at least one suggestion
      await page.waitForSelector('#ggcSuggestionList', { visible: true, timeout: 10000 })
      // Wait for at least one suggestion item (try common class names)
      await page.waitForFunction(() => {
        const list = document.querySelector('#ggcSuggestionList');
        if (!list || list.hasAttribute('hidden')) return false;
        return list.querySelectorAll('.list-group-item, [role="option"]').length > 0;
      }, { timeout: 10000 })

      // Click the first suggestion
      await page.evaluate(() => {
        const list = document.querySelector('#ggcSuggestionList');
        if (!list) return;
        const item = list.querySelector('.list-group-item, [role="option"]');
        if (item) (item as HTMLElement).click();
      })

      // Wait for the results sidebar to appear (sidebar-block--open)
      await page.waitForSelector('.sidebar-block.sidebar-block--open', { timeout: 20000 })

      // Extract WOZ data from the results page
      const wozData = await page.evaluate(() => {
        // WOZ values for all years
        const wozRows = Array.from(document.querySelectorAll('.woz-table .waarden-row')).map(row => {
          const date = row.querySelector('.wozwaarde-datum')?.textContent?.trim() || ''
          const value = row.querySelector('.wozwaarde-waarde')?.textContent?.trim() || ''
          return { date, value }
        })

        // Main value (most recent)
        const waardeCell = document.querySelector('.woz-table .waarden-row:first-child .wozwaarde-waarde')
        const datumCell = document.querySelector('.woz-table .waarden-row:first-child .wozwaarde-datum')
        let wozValueText = waardeCell ? waardeCell.textContent || '' : ''
        let year = datumCell ? datumCell.textContent || '' : ''

        // Fallback to old selectors if not found
        if (!wozValueText) {
          const selectors = [
            '.woz-waarde .bedrag',
            '.woz-waarde',
            '.woz-result .waarde',
            '.woz-result',
            '.result-value',
            '.waarde-bedrag',
            '.bedrag',
            '.waarde',
            '[data-testid="woz-value"]',
            '.woz-bedrag'
          ]

          for (const selector of selectors) {
            const element = document.querySelector(selector)
            if (element) {
              wozValueText = element.textContent || ''
              break
            }
          }
        }

        // If no specific selector works, try to find any element containing "€" and numbers
        if (!wozValueText) {
          const allElements = document.querySelectorAll('*')
          for (const element of Array.from(allElements)) {
            const text = element.textContent || ''
            if (text.includes('€') && /\d{3,}/.test(text) && text.length < 100 && !text.includes('per')) {
              wozValueText = text
              break
            }
          }
        }

        // Extract additional information
        const addressElement = document.querySelector('.adres, .address, .woz-adres, .property-address')
        const typeElement = document.querySelector('.objecttype, .object-type, .type, .property-type')
        const surfaceElement = document.querySelector('.oppervlakte, .surface-area, .m2, .area')

        // New fields
        const grondOppervlakte = document.querySelector('#kenmerk-grondoppervlakte')?.textContent?.trim() || ''
        const bouwjaar = document.querySelector('#kenmerk-bouwjaar')?.textContent?.trim() || ''
        const gebruiksdoel = document.querySelector('#kenmerk-gebruiksdoel')?.textContent?.trim() || ''
        const oppervlakte = document.querySelector('#kenmerk-oppervlakte')?.textContent?.trim() || ''
        const identificatie = document.querySelector('#kenmerk-wozobjectnummer')?.textContent?.trim() || ''
        const adresseerbaarObject = document.querySelector('#link-adresseerbaarobjectid')?.textContent?.trim() || ''
        const nummeraanduiding = document.querySelector('#link-nummeraanduidingid')?.textContent?.trim() || ''

        return {
          wozValueText: wozValueText.trim(),
          address: addressElement?.textContent?.trim() || '',
          year: year.trim(),
          objectType: typeElement?.textContent?.trim() || '',
          surfaceArea: surfaceElement?.textContent?.trim() || '',
          fullPageText: document.body.textContent || '',
          wozValues: wozRows,
          grondOppervlakte,
          bouwjaar,
          gebruiksdoel,
          oppervlakte,
          identificatie,
          adresseerbaarObject,
          nummeraanduiding
        }
      })

      await page.close()

      // Parse the WOZ value
      const wozValue = this.parseWOZValue(wozData.wozValueText)
      if (!wozValue) {
        // Try to extract from full page text as fallback
        const fallbackValue = this.parseWOZValue(wozData.fullPageText)
        if (!fallbackValue) {
          throw new Error(`Could not extract WOZ value from page. Found text: ${wozData.wozValueText}`)
        }
      }

      // Parse reference year
      const referenceYear = this.parseYear(wozData.year) || new Date().getFullYear() - 1

      // Parse surface area: prioritize 'oppervlakte' from Kenmerken, fallback to generic selector
      let surfaceArea: number | null = null;
      if (wozData.oppervlakte) {
        surfaceArea = this.parseSurfaceArea(wozData.oppervlakte);
      }
      if (!surfaceArea && wozData.surfaceArea) {
        surfaceArea = this.parseSurfaceArea(wozData.surfaceArea);
      }

      const result: WOZData = {
        address,
        postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
        wozValue: wozValue || 0,
        referenceYear,
        objectType: wozData.objectType || 'Woning',
        surfaceArea: surfaceArea || undefined,
        scrapedAt: new Date().toISOString(),
        sourceUrl: this.baseUrl,
        // Include all additional WOZ fields
        grondOppervlakte: wozData.grondOppervlakte,
        bouwjaar: wozData.bouwjaar,
        gebruiksdoel: wozData.gebruiksdoel,
        oppervlakte: wozData.oppervlakte,
        identificatie: wozData.identificatie,
        adresseerbaarObject: wozData.adresseerbaarObject,
        nummeraanduiding: wozData.nummeraanduiding,
        wozValues: wozData.wozValues
      }

      // Cache the result in database
      await this.cacheWOZData(result)
      
      // Cache in Redis for faster access
      await cacheService.set(cacheKey, result, { ttl: 86400, prefix: 'woz' }) // 24 hours

      Logger.audit('WOZ value scraped successfully', {
        address,
        postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
        wozValue: result.wozValue,
        referenceYear,
        hasAdditionalData: !!(result.bouwjaar || result.oppervlakte || result.grondOppervlakte)
      })

      return {
        success: true,
        data: result
      }

    } catch (error) {
      Logger.error('WOZ scraping failed', error as Error, {
        address,
        postalCode
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error'
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
      const testResult = await this.getWOZValue('Test 1', '1000AA')
      return testResult.success || testResult.cached === true
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