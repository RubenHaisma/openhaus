import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bed, Bath, Square, Heart, Filter } from 'lucide-react'
import Link from 'next/link'

// Mock property data
const properties = [
  {
    id: 1,
    address: "Keizersgracht 123",
    city: "Amsterdam",
    price: 875000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 120,
    images: ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"],
    status: "AVAILABLE",
    energyLabel: "B",
    description: "Karakteristieke grachtenpand in het hart van Amsterdam"
  },
  {
    id: 2,
    address: "Lange Voorhout 45",
    city: "Den Haag",
    price: 650000,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 85,
    images: ["https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg"],
    status: "AVAILABLE",
    energyLabel: "C",
    description: "Modern appartement nabij het centrum"
  },
  {
    id: 3,
    address: "Erasmuslaan 78",
    city: "Rotterdam",
    price: 425000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 140,
    images: ["https://images.pexels.com/photos/323772/pexels-photo-323772.jpeg"],
    status: "AVAILABLE",
    energyLabel: "A",
    description: "Ruime eengezinswoning met tuin"
  },
  {
    id: 4,
    address: "Oudegracht 156",
    city: "Utrecht",
    price: 525000,
    bedrooms: 3,
    bathrooms: 1,
    squareMeters: 95,
    images: ["https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg"],
    status: "AVAILABLE",
    energyLabel: "B",
    description: "Historisch pand met moderne afwerking"
  },
  {
    id: 5,
    address: "Wilhelminaplein 22",
    city: "Eindhoven",
    price: 385000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 110,
    images: ["https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg"],
    status: "AVAILABLE",
    energyLabel: "A+",
    description: "Nieuwbouw appartement met balkon"
  },
  {
    id: 6,
    address: "Marktplein 8",
    city: "Groningen",
    price: 295000,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 75,
    images: ["https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg"],
    status: "AVAILABLE",
    energyLabel: "C",
    description: "Gezellig stadshuis in historisch centrum"
  }
]

export default function BuyingPage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getEnergyLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return colors[label] || 'bg-gray-400'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Koop je nieuwe huis
        </h1>
        <p className="text-xl text-gray-600">
          Ontdek ons aanbod van zorgvuldig geselecteerde woningen
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Amsterdam</Badge>
              <Badge variant="outline">€200.000 - €600.000</Badge>
              <Badge variant="outline">2+ kamers</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={property.images[0]}
                alt={property.address}
                className="w-full h-48 object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Badge 
                className={`absolute bottom-2 left-2 ${getEnergyLabelColor(property.energyLabel)} text-white`}
              >
                {property.energyLabel}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {property.address}
                </h3>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.city}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {property.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Square className="w-4 h-4" />
                  <span>{property.squareMeters} m²</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(property.price)}
                </div>
                <Link href={`/kopen/${property.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Bekijk
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Niet gevonden wat je zoekt?
          </h2>
          <p className="text-gray-600 mb-6">
            Laat ons weten waar je naar zoekt en we helpen je de perfecte woning te vinden.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-lg">
            Zoekprofiel maken
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}