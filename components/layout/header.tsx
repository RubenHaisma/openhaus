"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Home, Menu, X, Phone } from 'lucide-react'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { name: 'Verkopen', href: '/sell' },
  { name: 'Kopen', href: '/buy' },
  { name: 'Financiering', href: '/finance' },
  { name: 'Over ons', href: '/about' },
]

export function Header() {
  const { isSignedIn, user } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm'
          : 'bg-white border-b border-neutral-100'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary group-hover:bg-primary/90 transition-colors">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              OpenHaus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link text-gray-700 hover:text-primary font-semibold transition-all duration-200 relative text-lg group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
            
            {isSignedIn && (
              <Link
                href="/dashboard"
                className="nav-link text-gray-700 hover:text-primary font-semibold transition-all duration-200 text-lg group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          {/* Desktop Auth & CTA */}
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" size="lg" className="text-gray-600 hover:text-primary text-lg font-medium">
              <Phone className="mr-2 h-5 w-5" />
              <span className="hidden lg:inline">020 123 4567</span>
              <span className="lg:hidden">Bel ons</span>
            </Button>
            
            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary text-lg font-semibold transition-all duration-200">
                    Inloggen
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="opendoor-button-primary shadow-lg hover:shadow-xl transition-all duration-200">
                    Gratis taxatie
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">OpenHaus</span>
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 py-6">
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-4 text-lg font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    {isSignedIn && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-4 text-lg font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Dashboard
                      </Link>
                    )}
                  </div>
                </nav>

                {/* Mobile Auth */}
                <div className="border-t border-neutral-200 pt-6">
                  <div className="space-y-3">
                    <Button variant="ghost" size="lg" className="w-full justify-start text-gray-600 text-lg">
                      <Phone className="mr-2 h-5 w-5" />
                      020 123 4567
                    </Button>
                    
                    {isSignedIn ? (
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <UserButton afterSignOutUrl="/" />
                        <span className="text-sm text-neutral-600">
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <SignInButton mode="modal">
                          <Button className="opendoor-button-secondary w-full">
                            Inloggen
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="opendoor-button-primary w-full">
                            Gratis taxatie
                          </Button>
                        </SignUpButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}