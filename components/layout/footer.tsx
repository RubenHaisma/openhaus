import Link from 'next/link'
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const navigation = {
  diensten: [
    { name: 'Huis verkopen', href: '/verkopen' },
    { name: 'Huis kopen', href: '/kopen' },
    { name: 'Hypotheekadvies', href: '/financiering' },
    { name: 'Gratis taxatie', href: '/taxatie' },
    { name: 'Marktplaats', href: '/marketplace' },
  ],
  bedrijf: [
    { name: 'Over ons', href: '/about' },
    { name: 'Hoe het werkt', href: '/how-it-works' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Pers', href: '/press' },
    { name: 'Blog', href: '/blog' },
  ],
  ondersteuning: [
    { name: 'Help center', href: '/help' },
    { name: 'Contact', href: '/contact' },
    { name: 'Veelgestelde vragen', href: '/faq' },
    { name: 'Status', href: '/status' },
    { name: 'API documentatie', href: '/docs' },
  ],
  juridisch: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Algemene Voorwaarden', href: '/terms' },
    { name: 'Cookie Beleid', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Blijf op de hoogte van de woningmarkt
            </h3>
            <p className="text-neutral-400 mb-6">
              Ontvang wekelijks marktinzichten, tips voor kopers en verkopers, en exclusieve aanbiedingen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Je e-mailadres"
                className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-primary-500"
              />
              <Button className="bg-primary-500 hover:bg-primary-600 text-white px-6">
                Aanmelden
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              Door je aan te melden ga je akkoord met onze{' '}
              <Link href="/privacy" className="underline hover:text-primary-400">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">OpenHaus</span>
            </div>
            <p className="text-neutral-400 mb-6 max-w-sm">
              Direct je huis verkopen of kopen in Nederland. 
              Snel, transparant en volledig digitaal – van taxatie tot notaris.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">020 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">info@openhaus.nl</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">Amsterdam, Nederland</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Diensten
            </h3>
            <ul className="space-y-3">
              {navigation.diensten.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Bedrijf
            </h3>
            <ul className="space-y-3">
              {navigation.bedrijf.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Ondersteuning
            </h3>
            <ul className="space-y-3">
              {navigation.ondersteuning.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Juridisch
            </h3>
            <ul className="space-y-3">
              {navigation.juridisch.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">
              © 2024 OpenHaus. Alle rechten voorbehouden.
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-neutral-400">
              <span>🇳🇱 Nederlands</span>
              <span>AFM vergunning: 12345678</span>
              <span>KvK: 87654321</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}