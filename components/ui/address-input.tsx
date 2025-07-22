"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface AddressInputProps {
  onSearch: (address: string, postalCode: string) => void
  placeholder?: string
  className?: string
}

export function AddressInput({ onSearch, placeholder = "Voer je adres in", className = "" }: AddressInputProps) {
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim() && postalCode.trim()) {
      onSearch(address.trim(), postalCode.trim())
    }
  }

  const validatePostalCode = (code: string) => {
    // Dutch postal code format: 1234AB
    const dutchPostalRegex = /^\d{4}[A-Z]{2}$/
    return dutchPostalRegex.test(code.replace(/\s/g, '').toUpperCase())
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <Input
          type="text"
          placeholder="Straatnaam en huisnummer"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1"
          required
        />
        <Input
          type="text"
          placeholder="1234AB"
          value={postalCode}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/\s/g, '')
            if (value.length <= 6) {
              setPostalCode(value)
            }
          }}
          className="md:w-32"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
        disabled={!address.trim() || !validatePostalCode(postalCode)}
      >
        <Search className="w-5 h-5 mr-2" />
        Wat is je huis waard?
      </Button>
    </form>
  )
}