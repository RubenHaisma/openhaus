"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { realDataValidator } from '@/lib/real-data/validation'

interface AddressInputProps {
  onSearch: (address: string, postalCode: string) => void
  placeholder?: string
  className?: string
  loading?: boolean
}

interface AddressSuggestion {
  address: string
  postalCode: string
  city: string
  country: string
}

export function AddressInput({ onSearch, placeholder, className, loading }: AddressInputProps) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [validationError, setValidationError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Mock address suggestions - in production, integrate with European geocoding services
  const mockSuggestions: AddressSuggestion[] = [
    { address: 'Keizersgracht 123', postalCode: '1015 CJ', city: 'Amsterdam', country: 'Netherlands' },
    { address: 'Herengracht 456', postalCode: '1017 BZ', city: 'Amsterdam', country: 'Netherlands' },
    { address: 'Prinsengracht 789', postalCode: '1016 HK', city: 'Amsterdam', country: 'Netherlands' },
    { address: 'Unter den Linden 12', postalCode: '10117', city: 'Berlin', country: 'Germany' },
    { address: 'Champs-Élysées 100', postalCode: '75008', city: 'Paris', country: 'France' },
    { address: 'Baker Street 221B', postalCode: 'NW1 6XE', city: 'London', country: 'United Kingdom' },
  ]

  useEffect(() => {
    if (value.length >= 3) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.address.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.city.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.postalCode.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setValue(`${suggestion.address}, ${suggestion.city}`)
    setShowSuggestions(false)
    onSearch(suggestion.address, suggestion.postalCode)
  }

  const handleSearch = () => {
    if (value.trim()) {
      // Extract postal code from input if possible
      const postalCodeMatch = value.match(/\b\d{4}\s?[A-Z]{2}\b|\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b|\b\d{5}\b/)
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
      
      // Validate postal code format for real data
      const validation = realDataValidator.validateCalculationInputs({
        postalCode: postalCode.trim()
      })
      
      if (!validation.valid) {
        setValidationError(validation.errors[0])
        return
      }
      
      setValidationError('')
      onSearch(value, postalCode)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Voer je adres in..."}
          className={cn(
            "pl-12 pr-24 h-14 text-lg border-2 border-gray-300 rounded-xl",
            "focus:border-primary focus:ring-4 focus:ring-primary/20",
            "transition-all duration-200",
            className
          )}
          disabled={loading}
          maxLength={7}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            onClick={handleSearch}
            disabled={loading || !value.trim()}
            className="mr-2 h-10 px-6 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Taxeer'
            )}
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="mt-2 text-sm text-red-600">
          {validationError}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Gegevens worden opgehaald uit Kadaster, CBS en NVM databases
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                "w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors",
                "flex items-center space-x-3 border-b border-gray-100 last:border-b-0",
                selectedIndex === index && "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {suggestion.address}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {suggestion.postalCode} {suggestion.city}, {suggestion.country}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-xs text-gray-400 font-medium">
                  {suggestion.country === 'Netherlands' ? '🇳🇱' :
                   suggestion.country === 'Germany' ? '🇩🇪' :
                   suggestion.country === 'France' ? '🇫🇷' :
                   suggestion.country === 'United Kingdom' ? '🇬🇧' : '🇪🇺'}
                </div>
              </div>
            </button>
          ))}
          
          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Powered by European Property Database</span>
              <div className="flex items-center space-x-2">
                <span>Gebruik ↑↓ om te navigeren</span>
                <span>•</span>
                <span>Enter om te selecteren</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}