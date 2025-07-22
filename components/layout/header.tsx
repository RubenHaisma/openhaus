"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, User } from 'lucide-react'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export function Header() {
  const { isSignedIn, user } = useUser()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">OpenHaus</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/verkopen" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Verkopen
            </Link>
            <Link 
              href="/kopen" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Kopen
            </Link>
            <Link 
              href="/financiering" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Financiering
            </Link>
            {isSignedIn && (
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Inloggen
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    Registreren
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}