export interface PropertyUrlData {
  id: string
  address: string
  city: string
  postalCode: string
  propertyType: string
  bedrooms: number
  askingPrice: number
}

export interface CityUrlData {
  city: string
  propertyType?: string
  priceRange?: string
}

export class SEOUrlGenerator {
  /**
   * Generate SEO-friendly property URL
   * Example: /huis-te-koop/amsterdam/keizersgracht-123-3-kamers-675000-euro
   */
  static generatePropertyUrl(property: PropertyUrlData): string {
    const citySlug = this.slugify(property.city)
    const addressSlug = this.slugify(property.address)
    const typeSlug = this.getPropertyTypeSlug(property.propertyType)
    const priceSlug = this.formatPriceForUrl(property.askingPrice)
    
    return `/huis-te-koop/${citySlug}/${addressSlug}-${property.bedrooms}-kamers-${priceSlug}-euro`
  }

  /**
   * Generate city-based property listing URLs
   * Example: /huizen-te-koop/amsterdam
   * Example: /appartementen-te-koop/amsterdam
   * Example: /huizen-te-koop/amsterdam/onder-500000-euro
   */
  static generateCityListingUrl(data: CityUrlData): string {
    const citySlug = this.slugify(data.city)
    const typeSlug = data.propertyType ? this.getPropertyTypeSlug(data.propertyType) : 'huizen'
    
    let url = `/${typeSlug}-te-koop/${citySlug}`
    
    if (data.priceRange) {
      url += `/${data.priceRange}`
    }
    
    return url
  }

  /**
   * Generate selling guide URLs
   * Example: /huis-verkopen/amsterdam
   * Example: /huis-verkopen/amsterdam/zonder-makelaar
   */
  static generateSellingGuideUrl(city: string, variant?: string): string {
    const citySlug = this.slugify(city)
    let url = `/huis-verkopen/${citySlug}`
    
    if (variant) {
      url += `/${this.slugify(variant)}`
    }
    
    return url
  }

  /**
   * Generate neighborhood URLs
   * Example: /huizen-te-koop/amsterdam/jordaan
   * Example: /huis-verkopen/amsterdam/de-pijp
   */
  static generateNeighborhoodUrl(city: string, neighborhood: string, type: 'buy' | 'sell' = 'buy'): string {
    const citySlug = this.slugify(city)
    const neighborhoodSlug = this.slugify(neighborhood)
    
    if (type === 'sell') {
      return `/huis-verkopen/${citySlug}/${neighborhoodSlug}`
    }
    
    return `/huizen-te-koop/${citySlug}/${neighborhoodSlug}`
  }

  /**
   * Generate price range URLs
   * Example: /huizen-te-koop/amsterdam/onder-400000-euro
   * Example: /huizen-te-koop/amsterdam/tussen-400000-600000-euro
   */
  static generatePriceRangeUrl(city: string, minPrice?: number, maxPrice?: number): string {
    const citySlug = this.slugify(city)
    let priceSlug = ''
    
    if (minPrice && maxPrice) {
      priceSlug = `tussen-${this.formatPriceForUrl(minPrice)}-${this.formatPriceForUrl(maxPrice)}-euro`
    } else if (maxPrice) {
      priceSlug = `onder-${this.formatPriceForUrl(maxPrice)}-euro`
    } else if (minPrice) {
      priceSlug = `vanaf-${this.formatPriceForUrl(minPrice)}-euro`
    }
    
    return `/huizen-te-koop/${citySlug}/${priceSlug}`
  }

  /**
   * Generate valuation URLs
   * Example: /woningtaxatie/amsterdam/keizersgracht-123
   */
  static generateValuationUrl(address: string, city: string): string {
    const citySlug = this.slugify(city)
    const addressSlug = this.slugify(address)
    
    return `/woningtaxatie/${citySlug}/${addressSlug}`
  }

  /**
   * Parse property URL to extract data
   */
  static parsePropertyUrl(url: string): { city: string; addressSlug: string; id?: string } | null {
    const match = url.match(/\/huis-te-koop\/([^\/]+)\/([^\/]+)/)
    if (!match) return null
    
    return {
      city: this.unslugify(match[1]),
      addressSlug: match[2],
    }
  }

  /**
   * Convert string to SEO-friendly slug
   */
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  /**
   * Convert slug back to readable text
   */
  public static unslugify(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Get property type slug for URLs
   */
  private static getPropertyTypeSlug(propertyType: string): string {
    const typeMap: Record<string, string> = {
      'HOUSE': 'huizen',
      'APARTMENT': 'appartementen',
      'TOWNHOUSE': 'rijtjeshuizen',
      'Eengezinswoning': 'huizen',
      'Appartement': 'appartementen',
      'Rijtjeshuis': 'rijtjeshuizen'
    }
    
    return typeMap[propertyType] || 'huizen'
  }

  /**
   * Format price for URL (remove thousands separators)
   */
  private static formatPriceForUrl(price: number): string {
    return Math.round(price / 1000).toString() + 'k'
  }

  /**
   * Generate canonical URL for a page
   */
  static generateCanonicalUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://WattVrij.nl'
    return `${baseUrl}${path}`
  }

  /**
   * Generate breadcrumb data for SEO
   */
  static generateBreadcrumbs(url: string): Array<{ name: string; url: string }> {
    const segments = url.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', url: '/' }]
    
    let currentPath = ''
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`
      const segment = segments[i]
      
      if (segment === 'huis-te-koop' || segment === 'huizen-te-koop') {
        breadcrumbs.push({ name: 'Huizen te koop', url: '/buy' })
      } else if (segment === 'huis-verkopen') {
        breadcrumbs.push({ name: 'Huis verkopen', url: '/sell' })
      } else if (segment === 'woningtaxatie') {
        breadcrumbs.push({ name: 'Woningtaxatie', url: '/instant-offer' })
      } else if (i === segments.length - 1) {
        // Last segment - use as is but prettify
        breadcrumbs.push({ 
          name: this.unslugify(segment), 
          url: currentPath 
        })
      } else {
        // City or intermediate segment
        breadcrumbs.push({ 
          name: this.unslugify(segment), 
          url: currentPath 
        })
      }
    }
    
    return breadcrumbs
  }
}