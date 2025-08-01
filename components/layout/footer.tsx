import Link from 'next/link'
import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const navigation = {
  diensten: [
    { name: 'Gratis energieadvies', href: '/energieadvies' },
    { name: 'Subsidie check', href: '/subsidies' },
    { name: 'Installateurs vinden', href: '/installateurs' },
    { name: 'Markt intelligentie', href: '/markt-intelligentie' },
    { name: 'ROI calculator', href: '/calculator' },
    { name: 'Compliance tracking', href: '/compliance' },
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
    <footer className="elegant-hero">
      {/* Newsletter Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Blijf op de hoogte van nieuwe subsidies
            </h3>
            <p className="text-gray-700 mb-8 text-lg">
              Ontvang meldingen over nieuwe subsidieregelingen, energietips en updates over de energietransitie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Je e-mailadres"
                className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-600 h-14 text-lg"
              />
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold">
                Aanmelden
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Door je aan te melden ga je akkoord met onze{' '}
              <Link href="/privacy" className="underline hover:text-green-600 text-gray-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">WattVrij</span>
            </div>
            <p className="text-gray-700 mb-8 max-w-sm text-lg leading-relaxed">
              Maak je woning energieneutraal voor 2030. Gratis advies, subsidies tot €25.000 
              en gecertificeerde installateurs.
            </p>
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-900 text-lg">info@WattVrij.nl</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-900 text-lg">Amsterdam, Nederland</span>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex space-x-6 mt-8">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-green-600 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Diensten
            </h3>
            <ul className="space-y-4">
              {navigation.diensten.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Bedrijf
            </h3>
            <ul className="space-y-4">
              {navigation.bedrijf.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Ondersteuning
            </h3>
            <ul className="space-y-4">
              {navigation.ondersteuning.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Juridisch
            </h3>
            <ul className="space-y-4">
              {navigation.juridisch.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-green-600 transition-colors"
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
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500">
              © 2025 WattVrij. Alle rechten voorbehouden.
            </p>
            <div className="flex items-center space-x-8 text-gray-500">
              <span>🇳🇱 Nederlands</span>
              <span>RVO Partner</span>
              <span>KvK: 87654321</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}