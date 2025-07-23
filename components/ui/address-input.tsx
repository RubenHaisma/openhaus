"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressInputProps {
  onSearch: (address: string, postalCode: string) => void
  placeholder?: string
  className?: string
  loading?: boolean
  initialQuery?: string
  initialLocation?: string
}

interface AddressSuggestion {
  address: string
  postalCode: string
  city: string
  fullAddress: string
}

export function AddressInput({ 
  onSearch, 
  placeholder = "Voer je adres in...", 
  className,
  loading = false,
  initialQuery = '',
  initialLocation = ''
}: AddressInputProps) {
  const [query, setQuery] = useState(initialQuery || initialLocation || '')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Mock address suggestions - in production, this would call a real geocoding API
  const mockSuggestions: AddressSuggestion[] = [
    {
      address: 'Keizersgracht 123',
      postalCode: '1015CJ',
      city: 'Amsterdam',
      fullAddress: 'Keizersgracht 123, 1015CJ Amsterdam'
    },
    {
      address: 'Herengracht 456',
      postalCode: '1017BZ',
      city: 'Amsterdam',
      fullAddress: 'Herengracht 456, 1017BZ Amsterdam'
    },
    {
      address: 'Prinsengracht 789',
      postalCode: '1016HT',
      city: 'Amsterdam',
      fullAddress: 'Prinsengracht 789, 1016HT Amsterdam'
    },
    {
      address: 'Coolsingel 100',
      postalCode: '3012AL',
      city: 'Rotterdam',
      fullAddress: 'Coolsingel 100, 3012AL Rotterdam'
    },
    {
      address: 'Lange Voorhout 50',
      postalCode: '2514EG',
      city: 'Den Haag',
      fullAddress: 'Lange Voorhout 50, 2514EG Den Haag'
    }
  ]

  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)

    if (value.length >= 3) {
      // Filter mock suggestions based on input
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.fullAddress.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.fullAddress)
    setShowSuggestions(false)
    onSearch(suggestion.address, suggestion.postalCode)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (suggestions.length > 0 && selectedIndex >= 0) {
      handleSuggestionClick(suggestions[selectedIndex])
      return
    }

    // Try to parse the input manually
    const parts = query.split(',').map(part => part.trim())
    if (parts.length >= 2) {
      const address = parts[0]
      const postalCodeMatch = query.match(/\b\d{4}\s?[A-Z]{2}\b/i)
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
      
      if (address && postalCode) {
        onSearch(address, postalCode)
        setShowSuggestions(false)
        return
      }
    }

    // If no postal code found, use first suggestion or show error
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0])
    } else {
      alert('Voer een geldig adres in met postcode')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn("pl-12 pr-24", className)}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Zoek'
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                selectedIndex === index && "bg-blue-50"
              )}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.address}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.postalCode} {suggestion.city}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}