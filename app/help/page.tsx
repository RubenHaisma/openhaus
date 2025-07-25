"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  HelpCircle, 
  Book, 
  Video, 
  MessageSquare,
  Phone,
  Mail,
  Users,
  Home,
  CreditCard,
  Shield,
  ArrowRight,
  ExternalLink,
  PlayCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'



export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Aan de slag',
      icon: Book,
      description: 'Leer hoe je WattVrij gebruikt',
      articles: 12,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'selling',
      title: 'Huis verkopen',
      icon: Home,
      description: 'Alles over het verkopen van je woning',
      articles: 18,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'buying',
      title: 'Huis kopen',
      icon: Search,
      description: 'Tips en tricks voor het kopen van een huis',
      articles: 15,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'account',
      title: 'Account beheer',
      icon: Users,
      description: 'Account instellingen en profielbeheer',
      articles: 8,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'payments',
      title: 'Betalingen',
      icon: CreditCard,
      description: 'Informatie over betalingen en kosten',
      articles: 6,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'safety',
      title: 'Veiligheid',
      icon: Shield,
      description: 'Veilig gebruik van het platform',
      articles: 10,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ]

  const popularArticles = [
    {
      title: 'Hoe bepaal ik de juiste verkoopprijs?',
      category: 'Verkopen',
      views: 2847,
      readTime: '5 min'
    },
    {
      title: 'Welke documenten heb ik nodig?',
      category: 'Verkopen',
      views: 2156,
      readTime: '3 min'
    },
    {
      title: 'Hoe maak ik een account aan?',
      category: 'Aan de slag',
      views: 1923,
      readTime: '2 min'
    },
    {
      title: 'Hoe upload ik foto\'s van mijn woning?',
      category: 'Verkopen',
      views: 1654,
      readTime: '4 min'
    },
    {
      title: 'Wat zijn de kosten voor kopers?',
      category: 'Kopen',
      views: 1432,
      readTime: '3 min'
    },
    {
      title: 'Hoe neem ik contact op met een verkoper?',
      category: 'Kopen',
      views: 1287,
      readTime: '2 min'
    }
  ]

  const videoTutorials = [
    {
      title: 'Je eerste woning plaatsen',
      duration: '8:32',
      views: 15420,
      thumbnail: '/videos/first-listing.jpg'
    },
    {
      title: 'Effectief zoeken naar woningen',
      duration: '6:15',
      views: 12380,
      thumbnail: '/videos/search-tips.jpg'
    },
    {
      title: 'Veilig communiceren met kopers',
      duration: '4:45',
      views: 9876,
      thumbnail: '/videos/safe-communication.jpg'
    },
    {
      title: 'Je profiel optimaliseren',
      duration: '5:20',
      views: 8654,
      thumbnail: '/videos/profile-optimization.jpg'
    }
  ]

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Direct chatten met onze support',
      availability: 'Ma-Vr 9:00-18:00',
      icon: MessageSquare,
      action: 'Start chat',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Telefoon',
      description: 'Bel ons voor directe hulp',
      availability: '020 123 4567',
      icon: Phone,
      action: 'Bel nu',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Email',
      description: 'Stuur ons een gedetailleerd bericht',
      availability: 'Reactie binnen 24u',
      icon: Mail,
      action: 'Email ons',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vind antwoorden op je vragen, leer hoe je WattVrij optimaal gebruikt 
              en krijg persoonlijke ondersteuning van ons team.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Zoek in help artikelen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
                <Button className="absolute right-2 top-2 h-10">
                  Zoeken
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="bg-white">
                200+ help artikelen
              </Badge>
              <Badge variant="outline" className="bg-white">
                Video tutorials
              </Badge>
              <Badge variant="outline" className="bg-white">
                24/7 ondersteuning
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Help Categorieën
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.articles} artikelen</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Populaire Artikelen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 flex-1">
                        {article.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span>{article.views.toLocaleString()} weergaven</span>
                      <span>{article.readTime} leestijd</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline" size="lg">
                Alle artikelen bekijken
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Video Tutorials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white opacity-80" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{video.views.toLocaleString()} weergaven</span>
                        <Video className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Persoonlijke Ondersteuning
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <option.icon className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{option.description}</p>
                    <p className="text-sm text-gray-500 mb-6">{option.availability}</p>
                    <Button className={`w-full ${option.color}`}>
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Snelle Links
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Account aanmaken', href: '/auth/signup' },
                  { title: 'Woning plaatsen', href: '/list-property' },
                  { title: 'Gratis taxatie', href: '/instant-offer' },
                  { title: 'Woningen zoeken', href: '/buy' },
                  { title: 'Hypotheek calculator', href: '/finance' },
                  { title: 'Veelgestelde vragen', href: '/faq' },
                  { title: 'Contact opnemen', href: '/contact' },
                  { title: 'Platform status', href: '/status' }
                ].map((link, index) => (
                  <Link key={index} href={link.href}>
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {link.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Still Need Help */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Nog steeds hulp nodig?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ons support team staat klaar om je persoonlijk te helpen
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Start een gesprek
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  asChild
                >
                  <a href="tel:+31201234567">
                    <Phone className="w-5 h-5 mr-2" />
                    020 123 4567
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}