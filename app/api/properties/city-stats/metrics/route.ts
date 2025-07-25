import { NextRequest, NextResponse } from 'next/server'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Helper to build Overpass QL for a city area id
function buildOverpassQueryWithArea(areaId: number) {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](area:${areaId});
      node["shop"](area:${areaId});
      node["amenity"="school"](area:${areaId});
      way["highway"="cycleway"](area:${areaId});
      node["public_transport"="stop_position"](area:${areaId});
      node["highway"="bus_stop"](area:${areaId});
      node["railway"="station"](area:${areaId});
    );
    out body;
  `
}

// Helper to build Overpass QL for a bounding box
function buildOverpassQueryWithBBox(bbox: string) {
  // bbox: south,west,north,east
  return `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](${bbox});
      node["shop"](${bbox});
      node["amenity"="school"](${bbox});
      way["highway"="cycleway"](${bbox});
      node["public_transport"="stop_position"](${bbox});
      node["highway"="bus_stop"](${bbox});
      node["railway"="station"](${bbox});
    );
    out body;
  `
}

// Helper to get OSM area id for a query (address or city)
async function getOsmAreaId(queryStr: string): Promise<number | null> {
  // Try admin_level 10 (neighborhood), 8 (municipality), 6 (province), 4 (country)
  const adminLevels = [10, 8, 6, 4]
  for (const level of adminLevels) {
    const query = `
      [out:json][timeout:10];
      area["name"="${queryStr}"]["boundary"="administrative"]["admin_level"="${level}"];
      out ids;
    `
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const data = await res.json()
    if (data.elements && data.elements.length > 0 && data.elements[0].id) {
      // OSM area id is 3600000000 + relation id
      return 3600000000 + data.elements[0].id
    }
  }
  return null
}

// Helper to get bbox from Nominatim
async function getBBox(queryStr: string): Promise<string | null> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(queryStr)}&format=json&limit=1&polygon_geojson=0`
  const res = await fetch(url, { headers: { 'User-Agent': 'WattVrij/1.0' } })
  const data = await res.json()
  if (data && data[0] && data[0].boundingbox) {
    // boundingbox: [south, north, west, east]
    const [south, north, west, east] = data[0].boundingbox
    // Overpass expects: south,west,north,east
    return `${south},${west},${north},${east}`
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  // Accept 'q' (full address or city), fallback to 'city'
  const queryStr = searchParams.get('q') || searchParams.get('city')
  if (!queryStr) {
    return NextResponse.json({ error: 'Missing q or city parameter' }, { status: 400 })
  }

  let query = ''
  let usedFallback = false
  let areaId = await getOsmAreaId(queryStr)
  if (areaId) {
    query = buildOverpassQueryWithArea(areaId)
  } else {
    // fallback to bbox
    const bbox = await getBBox(queryStr)
    if (!bbox) {
      return NextResponse.json({ error: 'Location not found in OSM or Nominatim' }, { status: 404 })
    }
    query = buildOverpassQueryWithBBox(bbox)
    usedFallback = true
  }

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    const data = await res.json()
    // Count features
    let restaurants = 0, shops = 0, schools = 0, bikeInfra = 0, transitStops = 0
    for (const el of data.elements) {
      if (el.tags) {
        if (el.tags.amenity === 'restaurant') restaurants++
        if (el.tags.shop) shops++
        if (el.tags.amenity === 'school') schools++
        if (el.tags.highway === 'cycleway') bikeInfra++
        if (
          el.tags.public_transport === 'stop_position' ||
          el.tags.highway === 'bus_stop' ||
          el.tags.railway === 'station'
        ) transitStops++
      }
    }
    return NextResponse.json({
      query: queryStr,
      restaurants,
      shops,
      schools,
      bikeInfra,
      transitStops,
      usedFallback
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch data', details: String(e) }, { status: 500 })
  }
} 