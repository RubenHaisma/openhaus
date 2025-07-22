import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  fullAddress: string
}

export function AddressInput({ onSearch, placeholder, className, loading }: AddressInputProps) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Dutch postal code and address validation
  const validateDutchAddress = (input: string): { address?: string; postalCode?: string } => {
    // Pattern for Dutch addresses: "Street 123, 1234AB" or "Street 123 1234AB" or "1234AB Street 123"
    const patterns = [
      /^(.+?)\s*,?\s*(\d{4}\s?[A-Z]{2})$/i, // Street 123, 1234AB
      /^(\d{4}\s?[A-Z]{2})\s+(.+)$/i,       // 1234AB Street 123
    ]

    for (const pattern of patterns) {
      const match = input.trim().match(pattern)
      if (match) {
        const [, part1, part2] = match
        
        // Check which part is the postal code
        if (/^\d{4}\s?[A-Z]{2}$/i.test(part1)) {
          return { postalCode: part1.replace(/\s/g, '').toUpperCase(), address: part2.trim() }
        } else if (/^\d{4}\s?[A-Z]{2}$/i.test(part2)) {
          return { postalCode: part2.replace(/\s/g, '').toUpperCase(), address: part1.trim() }
        }
      }
    }

    return {}
  }

  // Mock address suggestions (in production, this would call a real address API)
  const getAddressSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
    if (query.length < 3) return []

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))

    // Mock suggestions based on common Dutch addresses
    const mockSuggestions: AddressSuggestion[] = [
      { address: 'Keizersgracht 123', postalCode: '1015CJ', city: 'Amsterdam', fullAddress: 'Keizersgracht 123, 1015CJ Amsterdam' },
      { address: 'Herengracht 456', postalCode: '1017BZ', city: 'Amsterdam', fullAddress: 'Herengracht 456, 1017BZ Amsterdam' },
      { address: 'Prinsengracht 789', postalCode: '1016HT', city: 'Amsterdam', fullAddress: 'Prinsengracht 789, 1016HT Amsterdam' },
      { address: 'Lange Voorhout 45', postalCode: '2514EC', city: 'Den Haag', fullAddress: 'Lange Voorhout 45, 2514EC Den Haag' },
      { address: 'Erasmuslaan 78', postalCode: '3062PA', city: 'Rotterdam', fullAddress: 'Erasmuslaan 78, 3062PA Rotterdam' },
      { address: 'Oudegracht 156', postalCode: '3511AP', city: 'Utrecht', fullAddress: 'Oudegracht 156, 3511AP Utrecht' },
    ]

    return mockSuggestions.filter(suggestion =>
      suggestion.fullAddress.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    setSelectedIndex(-1)

    if (newValue.length >= 3) {
      setIsSearching(true)
      try {
        const suggestions = await getAddressSuggestions(newValue)
        setSuggestions(suggestions)
        setShowSuggestions(suggestions.length > 0)
      } catch (error) {
        console.error('Failed to get address suggestions:', error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsSearching(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex])
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

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    setValue(suggestion.fullAddress)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onSearch(suggestion.address, suggestion.postalCode)
  }

  const handleSearch = () => {
    const { address, postalCode } = validateDutchAddress(value)
    
    if (address && postalCode) {
      onSearch(address, postalCode)
    } else {
      // Show error or try to parse differently
      alert('Voer een geldig Nederlands adres in (bijv. "Keizersgracht 123, 1015CJ" of "1015CJ Keizersgracht 123")')
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Voer je adres in (bijv. Keizersgracht 123, 1015CJ)"}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn("pl-12 pr-24 h-14 text-lg", className)}
          disabled={loading}
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !value.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Zoek'
          )}
        </Button>
      </div>

      {/* Address Suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border-gray-200">
          <CardContent className="p-0" ref={suggestionsRef}>
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Adressen zoeken...
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors",
                      selectedIndex === index && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{suggestion.address}</div>
                        <div className="text-sm text-gray-600">{suggestion.postalCode} {suggestion.city}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Input Help Text */}
      <div className="mt-2 text-sm text-gray-500">
        Voer een volledig Nederlands adres in inclusief postcode (bijv. "Keizersgracht 123, 1015CJ")
      </div>
    </div>
  )
}