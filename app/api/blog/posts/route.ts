import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from a CMS or database
    // For now, return structured blog data that could come from a headless CMS
    
    const posts = [
      {
        id: '1',
        title: 'Vastgoedmarkt 2025: Wat kunnen we verwachten?',
        excerpt: 'Een uitgebreide analyse van de verwachtingen voor de Nederlandse vastgoedmarkt in 2025, inclusief prijsontwikkelingen en markttrends.',
        author: 'Sarah van der Berg',
        date: '2024-12-15',
        readTime: '8 min',
        category: 'Markttrends',
        slug: 'vastgoedmarkt-2025-verwachtingen',
        published: true
      },
      {
        id: '2',
        title: '10 Tips voor het fotograferen van je woning',
        excerpt: 'Professionele tips om je woning optimaal in beeld te brengen en meer kopers aan te trekken.',
        author: 'Mark Janssen',
        date: '2024-12-12',
        readTime: '5 min',
        category: 'Verkoop tips',
        slug: 'tips-fotograferen-woning',
        published: true
      },
      {
        id: '3',
        title: 'Energielabels en hun impact op de woningwaarde',
        excerpt: 'Hoe energielabels de waarde van je woning beïnvloeden en wat je kunt doen om te verbeteren.',
        author: 'Lisa de Vries',
        date: '2024-12-10',
        readTime: '6 min',
        category: 'Inzichten',
        slug: 'energielabels-woningwaarde-impact',
        published: true
      }
    ]

    const featured = posts.find(post => post.id === '1') || null

    return NextResponse.json({
      posts: posts.filter(post => post.published),
      featured,
      total: posts.length
    })
  } catch (error) {
    Logger.error('Blog posts retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Blog posts retrieval failed' },
      { status: 500 }
    )
  }
}