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
      // ALWAYS use production scraper in production or when Puppeteer is not available
      if (process.env.NODE_ENV === 'production' || process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true') {
        Logger.info('Using production WOZ scraper (no Puppeteer)', { address, postalCode })
        const result = await productionWozScraper.getWOZValue(address, postalCode)
        return {
          success: result.success,
          data: result.data,
          error: result.error,
          cached: result.cached
        }
      }

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

      // Check database cache
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

      // NO CACHED DATA - MUST SCRAPE REAL WOZ DATA
      Logger.info('No cached WOZ data found - starting real scraping from wozwaardeloket.nl', { address, postalCode })
      
      await this.initBrowser()
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser for WOZ scraping')
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

      Logger.info('Successfully loaded wozwaardeloket.nl', { address, postalCode })

      // Wait for the new search input to load
      await page.waitForSelector('#ggcSearchInput', { timeout: 10000 })

      // Type the full address (e.g., "Kampweg 10, 3769DG") into the search input
      const fullAddress = `${address}, ${postalCode.replace(/\s/g, '').toUpperCase()}`
      Logger.info('Searching for address on WOZ website', { fullAddress })
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
        console.log('Extracting WOZ data from page...')
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
        Logger.error('Failed to parse WOZ value', new Error('No WOZ value found'), { 
          address, 
          postalCode, 
          extractedText: wozData.wozValueText,
          fullPageLength: wozData.fullPageText?.length || 0
        })
        throw new Error(`Could not extract WOZ value from wozwaardeloket.nl. Found text: "${wozData.wozValueText}". Please check if the address is correct.`)
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
      Logger.error('REAL WOZ scraping failed - NO FALLBACK TO MOCK DATA', error as Error, {
        address,
        postalCode
      })
      // Ensure error is always visible in production logs
      console.error('WOZ SCRAPER ERROR:', error);

      return {
        success: false,
        error: `WOZ scraping failed: ${error instanceof Error ? error.message : 'Unknown scraping error'}. Please verify the address exists in the WOZ database.`
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
      // Use production scraper health check in production or when Puppeteer is disabled
      if (process.env.NODE_ENV === 'production' || process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true') {
        return await productionWozScraper.healthCheck()
      }

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