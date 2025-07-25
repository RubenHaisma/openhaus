"use client"

import { useState, useEffect, useRef } from 'react'
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
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
    const { address, postalCode } = parseFullAddress(fullAddress)
    if (!address || !postalCode) {
      alert('Voer een volledig adres in met postcode (bijv. Keizersgracht 123, 1015CJ Amsterdam)')
      return
    }
    onSearch(address, postalCode)
    setShowSuggestions(false)
  }

  const handleInputChange = async (value: string) => {
    setFullAddress(value)
    setSuggestionsError(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (value.length > 3) {
      setSuggestionsLoading(true)
      setShowSuggestions(false)
      const controller = new AbortController()
      abortControllerRef.current = controller
      try {
        // Use the Next.js API route as a proxy
        const res = await fetch(`/api/address-search?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Fout bij ophalen van adressuggesties')
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSuggestionsError('Fout bij ophalen van adressuggesties')
          setSuggestions([])
          setShowSuggestions(false)
        }
      } finally {
        setSuggestionsLoading(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion: any) => {
    // Compose a nice address string for the input
    setFullAddress(suggestion.display_name)
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
            autoComplete="off"
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
      {suggestionsLoading && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-4 text-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Laden...
        </div>
      )}
      {suggestionsError && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-red-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-4 text-center text-red-500">
          {suggestionsError}
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && !suggestionsLoading && !suggestionsError && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              type="button"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{suggestion.display_name}</span>
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

  // Remove postal code and trailing commas/spaces
  let addressPart = fullAddress.replace(postalCodeMatch[0], '').replace(/,?\s*$/, '').trim()

  // Try to extract the first occurrence of a house number and street name (Dutch style)
  // e.g. 'Europaplein 779', '779 Europaplein', '779, Europaplein, ...'
  // We'll look for either 'streetname housenumber' or 'housenumber streetname'
  // and ignore extra locality/country info
  let address = ''
  // Try 'streetname housenumber' (e.g. 'Europaplein 779')
  let match = addressPart.match(/([A-Za-zÀ-ÿ'\-\. ]+\d+[A-Za-z]?)/)
  if (match) {
    address = match[1].trim()
  } else {
    // Try 'housenumber streetname' (e.g. '779 Europaplein')
    match = addressPart.match(/(\d+[A-Za-z]? [A-Za-zÀ-ÿ'\-\. ]+)/)
    if (match) {
      address = match[1].trim()
    } else {
      // Try splitting by comma and taking the first two parts (e.g. '779, Europaplein, ...')
      const parts = addressPart.split(',').map(p => p.trim()).filter(Boolean)
      if (parts.length >= 2 && /^\d+/.test(parts[0])) {
        address = `${parts[1]} ${parts[0]}`.trim()
      } else if (parts.length > 0) {
        address = parts[0]
      }
    }
  }
  return { address, postalCode }
}