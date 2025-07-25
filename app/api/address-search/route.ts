import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q || q.length < 3) {
    return NextResponse.json([], { status: 200 })
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=nl&q=${encodeURIComponent(q)}`

  try {
    // Log the outgoing request
    console.log('[address-search] Fetching:', url)
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'nl',
        'User-Agent': 'WattVrij.nl address search (info@WattVrij.nl)'
      }
    })
    console.log('[address-search] Response status:', res.status)
    if (!res.ok) {
      let errorText = await res.text()
      console.error('[address-search] Nominatim error:', errorText)
      return NextResponse.json({ error: 'Nominatim error', details: errorText }, { status: 500 })
    }
    const data = await res.json()
    // Set CORS headers for localhost dev
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (err) {
    console.error('[address-search] Proxy error:', err)
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 500 })
  }
} 