import Link from 'next/link'
import { Home, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">OpenHaus</span>
            </div>
            <p className="text-gray-300 text-sm">
              Direct je huis verkopen of kopen in Nederland. 
              Snel, transparant en volledig digitaal.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Diensten</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/verkopen" className="text-gray-300 hover:text-white">Huis verkopen</Link></li>
              <li><Link href="/kopen" className="text-gray-300 hover:text-white">Huis kopen</Link></li>
              <li><Link href="/financiering" className="text-gray-300 hover:text-white">Hypotheekadvies</Link></li>
              <li><Link href="/taxatie" className="text-gray-300 hover:text-white">Gratis taxatie</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Ondersteuning</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-gray-300 hover:text-white">Veelgestelde vragen</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">Over ons</Link></li>
              <li><Link href="/help" className="text-gray-300 hover:text-white">Help center</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">020 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">info@openhaus.nl</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Amsterdam, Nederland</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 OpenHaus. Alle rechten voorbehouden.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Algemene Voorwaarden</Link>
            <Link href="/cookies" className="hover:text-white">Cookie Beleid</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}