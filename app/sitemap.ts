import { MetadataRoute } from 'next'
import { SEOUrlGenerator } from '@/lib/seo/url-generator'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://WattVrij.nl'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instant-offer`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/finance`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ]

  // Major cities with SEO-optimized URLs
  const cities = [
    { slug: 'amsterdam', name: 'Amsterdam' },
    { slug: 'rotterdam', name: 'Rotterdam' },
    { slug: 'den-haag', name: 'Den Haag' },
    { slug: 'utrecht', name: 'Utrecht' },
    { slug: 'eindhoven', name: 'Eindhoven' },
    { slug: 'groningen', name: 'Groningen' },
    { slug: 'arnhem', name: 'Arnhem' },
    { slug: 'enschede', name: 'Enschede' },
    { slug: 'haarlem', name: 'Haarlem' },
    { slug: 'almere', name: 'Almere' },
    { slug: 'tilburg', name: 'Tilburg' },
    { slug: 'breda', name: 'Breda' },
    { slug: 'nijmegen', name: 'Nijmegen' },
    { slug: 'apeldoorn', name: 'Apeldoorn' },
    { slug: 'heerlen', name: 'Heerlen' }
  ]
  
  // Generate comprehensive city-based URLs
  const cityPages = cities.flatMap(city => [
    // Main city pages
    {
      url: `${baseUrl}/huizen-te-koop/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/appartementen-te-koop/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rijtjeshuizen-te-koop/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // Selling pages
    {
      url: `${baseUrl}/huis-verkopen/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Valuation pages
    {
      url: `${baseUrl}/woningtaxatie/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    // Price range pages
    {
      url: `${baseUrl}/huizen-te-koop/${city.slug}/onder-400k-euro`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/huizen-te-koop/${city.slug}/tussen-400k-600k-euro`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/huizen-te-koop/${city.slug}/vanaf-600k-euro`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ])

  // Neighborhood pages for major cities
  const neighborhoodPages = [
    // Amsterdam neighborhoods
    { city: 'amsterdam', neighborhood: 'jordaan' },
    { city: 'amsterdam', neighborhood: 'de-pijp' },
    { city: 'amsterdam', neighborhood: 'centrum' },
    { city: 'amsterdam', neighborhood: 'oud-zuid' },
    { city: 'amsterdam', neighborhood: 'noord' },
    { city: 'amsterdam', neighborhood: 'oost' },
    // Rotterdam neighborhoods
    { city: 'rotterdam', neighborhood: 'centrum' },
    { city: 'rotterdam', neighborhood: 'kralingen' },
    { city: 'rotterdam', neighborhood: 'hillegersberg' },
    // Den Haag neighborhoods
    { city: 'den-haag', neighborhood: 'centrum' },
    { city: 'den-haag', neighborhood: 'scheveningen' },
    { city: 'den-haag', neighborhood: 'benoordenhout' },
    // Utrecht neighborhoods
    { city: 'utrecht', neighborhood: 'centrum' },
    { city: 'utrecht', neighborhood: 'wittevrouwen' },
    { city: 'utrecht', neighborhood: 'lombok' },
  ].map(item => ({
    url: `${baseUrl}/huizen-te-koop/${item.city}/${item.neighborhood}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Guide pages
  const guidePages = [
    {
      url: `${baseUrl}/gids/huis-verkopen-zonder-makelaar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gids/huis-kopen-particulier`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gids/hypotheek-aanvragen`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gids/woningtaxatie`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  return [
    ...staticPages,
    ...cityPages,
    ...neighborhoodPages,
    ...guidePages,
  ]
}