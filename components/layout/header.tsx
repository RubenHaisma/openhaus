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
  { name: 'Verkopen', href: '/verkopen' },
  { name: 'Kopen', href: '/kopen' },
  { name: 'Financiering', href: '/financiering' },
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 group-hover:bg-primary-600 transition-colors">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
              OpenHaus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link text-neutral-700 hover:text-primary-600 font-medium transition-colors relative"
              >
                {item.name}
              </Link>
            ))}
            
            {isSignedIn && (
              <Link
                href="/dashboard"
                className="nav-link text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Auth & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-primary-600">
              <Phone className="mr-2 h-4 w-4" />
              020 123 4567
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
                  <Button variant="ghost" className="text-neutral-700 hover:text-primary-600">
                    Inloggen
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-neutral-900">OpenHaus</span>
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
                        className="block px-3 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    {isSignedIn && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        Dashboard
                      </Link>
                    )}
                  </div>
                </nav>

                {/* Mobile Auth */}
                <div className="border-t border-neutral-200 pt-6">
                  <div className="space-y-3">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-neutral-600">
                      <Phone className="mr-2 h-4 w-4" />
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
                          <Button variant="outline" className="w-full">
                            Inloggen
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
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