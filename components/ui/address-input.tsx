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

    // Simple address parsing - in production you'd use a proper address parser
    const addressParts = address.trim().split(',')
    
    if (addressParts.length >= 2) {
      const streetAddress = addressParts[0].trim()
      const postalCodePart = addressParts[1].trim()
      
      // Extract postal code (format: 1234AB or 1234 AB)
      const postalCodeMatch = postalCodePart.match(/(\d{4}\s?[A-Z]{2})/i)
      
      if (postalCodeMatch) {
        const postalCode = postalCodeMatch[1].replace(/\s/g, '').toUpperCase()
        onSearch(streetAddress, postalCode)
      } else {
        // If no postal code found, try to extract from the address itself
        const fullAddressMatch = address.match(/(.+?)(\d{4}\s?[A-Z]{2})/i)
        if (fullAddressMatch) {
          const streetAddr = fullAddressMatch[1].trim().replace(/,$/, '')
          const postal = fullAddressMatch[2].replace(/\s/g, '').toUpperCase()
          onSearch(streetAddr, postal)
        } else {
          alert('Voer een volledig adres in met postcode (bijv. "Keizersgracht 123, 1015CJ")')
        }
      }
    } else {
      // Try to parse single string with postal code
      const fullAddressMatch = address.match(/(.+?)(\d{4}\s?[A-Z]{2})/i)
      if (fullAddressMatch) {
        const streetAddr = fullAddressMatch[1].trim().replace(/,$/, '')
        const postal = fullAddressMatch[2].replace(/\s/g, '').toUpperCase()
        onSearch(streetAddr, postal)
      } else {
        alert('Voer een volledig adres in met postcode (bijv. "Keizersgracht 123, 1015CJ")')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-12 pr-32", className)}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !address.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[calc(100%-8px)]"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Zoek
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Voorbeeld: "Keizersgracht 123, 1015CJ" of "Keizersgracht 123 1015CJ"
      </div>
    </form>
  )
}