"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressInputProps {
  onSearch: (address: string, postalCode: string) => void
  placeholder?: string
  className?: string
  loading?: boolean
  initialAddress?: string
  initialPostalCode?: string
}

export function AddressInput({ 
  onSearch, 
  placeholder = "Voer je adres in...", 
  className,
  loading = false,
  initialAddress = '',
  initialPostalCode = ''
}: AddressInputProps) {
  const [fullAddress, setFullAddress] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Set initial value if provided
  useEffect(() => {
    if (initialAddress && initialPostalCode) {
      setFullAddress(`${initialAddress}, ${initialPostalCode}`)
    }
  }, [initialAddress, initialPostalCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleSearch = () => {
    if (!fullAddress.trim()) return

    // Parse address and postal code from full address
    const { address, postalCode } = parseFullAddress(fullAddress)
    
    if (!address || !postalCode) {
      alert('Voer een volledig adres in met postcode (bijv. Keizersgracht 123, 1015CJ Amsterdam)')
      return
    }

    onSearch(address, postalCode)
    setShowSuggestions(false)
  }

  const handleInputChange = (value: string) => {
    setFullAddress(value)
    
    // Generate suggestions based on input
    if (value.length > 3) {
      const newSuggestions = generateAddressSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setFullAddress(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={fullAddress}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={cn("pl-12 pr-32", className)}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !fullAddress.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Taxeer
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Address Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function parseFullAddress(fullAddress: string): { address: string; postalCode: string } {
  // Try to extract postal code (Dutch format: 1234AB)
  const postalCodeMatch = fullAddress.match(/\b(\d{4}\s?[A-Z]{2})\b/i)
  
  if (!postalCodeMatch) {
    return { address: '', postalCode: '' }
  }
  
  const postalCode = postalCodeMatch[1].replace(/\s/g, '').toUpperCase()
  const address = fullAddress.replace(postalCodeMatch[0], '').replace(/,\s*$/, '').trim()
  
  // Remove city name if present (everything after the last comma)
  const addressParts = address.split(',')
  const cleanAddress = addressParts.length > 1 ? addressParts.slice(0, -1).join(',').trim() : address
  
  return { address: cleanAddress, postalCode }
}

function generateAddressSuggestions(input: string): string[] {
  // Generate realistic Dutch address suggestions
  const suggestions: string[] = []
  
  // Common Dutch street names and cities
  const streetNames = [
    'Hoofdstraat', 'Kerkstraat', 'Schoolstraat', 'Dorpsstraat', 'Molenstraat',
    'Nieuwstraat', 'Marktstraat', 'Stationsstraat', 'Wilhelminastraat', 'Koningstraat'
  ]
  
  const cities = [
    'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven',
    'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'
  ]
  
  // If input looks like it might be a street name
  if (input.length > 3 && !input.includes(',')) {
    streetNames.forEach(street => {
      if (street.toLowerCase().includes(input.toLowerCase())) {
        cities.slice(0, 3).forEach(city => {
          suggestions.push(`${street} 1, 1000AA ${city}`)
        })
      }
    })
  }
  
  // If input includes a comma, suggest postal codes
  if (input.includes(',')) {
    const parts = input.split(',')
    if (parts.length >= 2) {
      const streetPart = parts[0].trim()
      suggestions.push(
        `${streetPart}, 1000AA Amsterdam`,
        `${streetPart}, 3000AA Rotterdam`,
        `${streetPart}, 2500AA Den Haag`
      )
    }
  }
  
  return suggestions.slice(0, 5) // Limit to 5 suggestions
}