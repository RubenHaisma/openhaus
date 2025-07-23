"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressInputProps {
  onSearch: (address: string, postalCode: string) => void
  placeholder?: string
  className?: string
  loading?: boolean
}

export function AddressInput({ 
  onSearch, 
  placeholder = "Voer je adres in...", 
  className,
  loading = false 
}: AddressInputProps) {
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address.trim()) return

    // Simple Dutch address parsing
    // Expected format: "Straatnaam 123, 1234AB" or "Straatnaam 123 1234AB"
    const addressParts = address.trim().split(/[,\s]+/)
    
    // Find postal code (4 digits + 2 letters)
    const postalCodeIndex = addressParts.findIndex(part => 
      /^\d{4}[A-Z]{2}$/i.test(part.replace(/\s/g, ''))
    )
    
    if (postalCodeIndex === -1) {
      alert('Voer een geldig Nederlands adres in met postcode (bijv. "Keizersgracht 123, 1015CJ")')
      return
    }

    const postalCode = addressParts[postalCodeIndex].replace(/\s/g, '').toUpperCase()
    const streetAddress = addressParts.slice(0, postalCodeIndex).join(' ')

    if (!streetAddress) {
      alert('Voer een volledig adres in met straatnaam en huisnummer')
      return
    }

    onSearch(streetAddress, postalCode)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10 pr-24", className)}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !address.trim()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Bijv. "Keizersgracht 123, 1015CJ Amsterdam"
      </p>
    </form>
  )
}