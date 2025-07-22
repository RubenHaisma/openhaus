import puppeteer from 'puppeteer'
import { supabase } from '@/lib/supabase'
import { Logger } from '@/lib/monitoring/logger'

export interface WOZData {
  address: string
  postalCode: string
  wozValue: number
  referenceYear: number
  objectType: string
  surfaceArea?: number
  scrapedAt: string
  sourceUrl: string
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

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      })
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
      // First check if we have cached data
      const cachedData = await this.getCachedWOZData(address, postalCode)
      if (cachedData) {
        Logger.info('WOZ data retrieved from cache', { address, postalCode })
        return {
          success: true,
          data: cachedData,
          cached: true
        }
      }

      // Initialize browser if needed
      await this.initBrowser()
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser')
      }

      const page = await this.browser.newPage()
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // Navigate to WOZ website
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' })

      // Wait for the search form to load
      await page.waitForSelector('input[name="postcode"]', { timeout: 10000 })

      // Clean postal code (remove spaces)
      const cleanPostalCode = postalCode.replace(/\s/g, '').toUpperCase()
      
      // Extract house number from address
      const houseNumberMatch = address.match(/(\d+)/)
      if (!houseNumberMatch) {
        throw new Error('Could not extract house number from address')
      }
      const houseNumber = houseNumberMatch[1]

      // Fill in the search form
      await page.type('input[name="postcode"]', cleanPostalCode)
      await page.type('input[name="huisnummer"]', houseNumber)

      // Check if there's a house number addition field
      const houseAdditionMatch = address.match(/\d+\s*([a-zA-Z]+)/)
      if (houseAdditionMatch) {
        const houseAddition = houseAdditionMatch[1]
        const additionField = await page.$('input[name="huisnummer_toevoeging"]')
        if (additionField) {
          await page.type('input[name="huisnummer_toevoeging"]', houseAddition)
        }
      }

      // Submit the form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"], input[type="submit"]')
      ])

      // Wait for results to load
      await page.waitForSelector('.woz-result, .result-container, .woz-waarde', { timeout: 15000 })

      // Extract WOZ data from the results page
      const wozData = await page.evaluate(() => {
        // Try multiple selectors as the website structure might vary
        const selectors = [
          '.woz-waarde .bedrag',
          '.woz-result .waarde',
          '.result-value',
          '[data-testid="woz-value"]',
          '.woz-bedrag',
          '.waarde-bedrag'
        ]

        let wozValueText = ''
        for (const selector of selectors) {
          const element = document.querySelector(selector)
          if (element) {
            wozValueText = element.textContent || ''
            break
          }
        }

        // If no specific selector works, try to find any element containing "€" and numbers
        if (!wozValueText) {
          const allElements = document.querySelectorAll('*')
          for (const element of allElements) {
            const text = element.textContent || ''
            if (text.includes('€') && /\d{3,}/.test(text) && text.length < 50) {
              wozValueText = text
              break
            }
          }
        }

        // Extract additional information
        const addressElement = document.querySelector('.adres, .address, .woz-adres')
        const yearElement = document.querySelector('.peiljaar, .reference-year, .jaar')
        const typeElement = document.querySelector('.objecttype, .object-type, .type')
        const surfaceElement = document.querySelector('.oppervlakte, .surface-area, .m2')

        return {
          wozValueText: wozValueText.trim(),
          address: addressElement?.textContent?.trim() || '',
          year: yearElement?.textContent?.trim() || '',
          objectType: typeElement?.textContent?.trim() || '',
          surfaceArea: surfaceElement?.textContent?.trim() || ''
        }
      })

      await page.close()

      // Parse the WOZ value
      const wozValue = this.parseWOZValue(wozData.wozValueText)
      if (!wozValue) {
        throw new Error('Could not extract WOZ value from page')
      }

      // Parse reference year
      const referenceYear = this.parseYear(wozData.year) || new Date().getFullYear() - 1

      // Parse surface area if available
      const surfaceArea = this.parseSurfaceArea(wozData.surfaceArea)

      const result: WOZData = {
        address,
        postalCode: cleanPostalCode,
        wozValue,
        referenceYear,
        objectType: wozData.objectType || 'Woning',
        surfaceArea,
        scrapedAt: new Date().toISOString(),
        sourceUrl: this.baseUrl
      }

      // Cache the result in database
      await this.cacheWOZData(result)

      Logger.audit('WOZ value scraped successfully', {
        address,
        postalCode: cleanPostalCode,
        wozValue,
        referenceYear
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

    // Remove all non-digit characters except decimal separators
    const cleanText = text.replace(/[^\d.,]/g, '')
    
    // Handle different number formats
    const numberMatch = cleanText.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/)
    if (!numberMatch) return null

    let numberStr = numberMatch[1]
    
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
    const yearMatch = text.match(/20\d{2}/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  private parseSurfaceArea(text: string): number | null {
    if (!text) return null
    const areaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*m/)
    if (!areaMatch) return null
    return parseFloat(areaMatch[1].replace(',', '.'))
  }

  private async getCachedWOZData(address: string, postalCode: string): Promise<WOZData | null> {
    try {
      const { data, error } = await supabase
        .from('woz_cache')
        .select('*')
        .eq('address', address)
        .eq('postal_code', postalCode.replace(/\s/g, '').toUpperCase())
        .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 days cache
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return {
        address: data.address,
        postalCode: data.postal_code,
        wozValue: data.woz_value,
        referenceYear: data.reference_year,
        objectType: data.object_type,
        surfaceArea: data.surface_area,
        scrapedAt: data.scraped_at,
        sourceUrl: data.source_url
      }
    } catch (error) {
      Logger.error('Failed to retrieve cached WOZ data', error as Error)
      return null
    }
  }

  private async cacheWOZData(data: WOZData): Promise<void> {
    try {
      const { error } = await supabase
        .from('woz_cache')
        .upsert({
          address: data.address,
          postal_code: data.postalCode,
          woz_value: data.wozValue,
          reference_year: data.referenceYear,
          object_type: data.objectType,
          surface_area: data.surfaceArea,
          scraped_at: data.scrapedAt,
          source_url: data.sourceUrl
        }, {
          onConflict: 'address,postal_code'
        })

      if (error) {
        Logger.error('Failed to cache WOZ data', error)
      }
    } catch (error) {
      Logger.error('Failed to cache WOZ data', error as Error)
    }
  }

  async cleanup(): Promise<void> {
    await this.closeBrowser()
  }
}

export const wozScraper = new WOZScraper()

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