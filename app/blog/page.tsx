"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  TrendingUp,
  Home,
  Calculator,
  Lightbulb,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | OpenHaus - Vastgoed tips, trends en inzichten',
  description: 'Lees de laatste vastgoed tips, markttrends en inzichten op de OpenHaus blog. Expert advies voor het kopen en verkopen van huizen.',
  keywords: ['vastgoed blog', 'huizen tips', 'markttrends', 'vastgoed nieuws', 'huis kopen tips', 'huis verkopen tips']
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Alle artikelen', icon: FileText },
    { id: 'market-trends', name: 'Markttrends', icon: TrendingUp },
    { id: 'buying-tips', name: 'Koop tips', icon: Home },
    { id: 'selling-tips', name: 'Verkoop tips', icon: Calculator },
    { id: 'insights', name: 'Inzichten', icon: Lightbulb },
    { id: 'data', name: 'Data & Analyse', icon: BarChart3 }
  ]

  const featuredPost = {
    id: '1',
    title: 'Vastgoedmarkt 2025: Wat kunnen we verwachten?',
    excerpt: 'Een uitgebreide analyse van de verwachtingen voor de Nederlandse vastgoedmarkt in 2025, inclusief prijsontwikkelingen en markttrends.',
    author: 'Sarah van der Berg',
    date: '2024-12-15',
    readTime: '8 min',
    category: 'Markttrends',
    image: '/blog/market-2025.jpg',
    featured: true
  }

  const blogPosts = [
    {
      id: '2',
      title: '10 Tips voor het fotograferen van je woning',
      excerpt: 'Professionele tips om je woning optimaal in beeld te brengen en meer kopers aan te trekken.',
      author: 'Mark Janssen',
      date: '2024-12-12',
      readTime: '5 min',
      category: 'Verkoop tips',
      image: '/blog/photography-tips.jpg'
    },
    {
      id: '3',
      title: 'Energielabels en hun impact op de woningwaarde',
      excerpt: 'Hoe energielabels de waarde van je woning beïnvloeden en wat je kunt doen om te verbeteren.',
      author: 'Lisa de Vries',
      date: '2024-12-10',
      readTime: '6 min',
      category: 'Inzichten',
      image: '/blog/energy-labels.jpg'
    },
    {
      id: '4',
      title: 'Hypotheekrente ontwikkelingen december 2024',
      excerpt: 'Actuele ontwikkelingen in hypotheekrente en wat dit betekent voor kopers.',
      author: 'Tom Bakker',
      date: '2024-12-08',
      readTime: '4 min',
      category: 'Markttrends',
      image: '/blog/mortgage-rates.jpg'
    },
    {
      id: '5',
      title: 'Checklist: Je eerste huis kopen',
      excerpt: 'Complete checklist voor starters op de woningmarkt met alle belangrijke stappen.',
      author: 'Sarah van der Berg',
      date: '2024-12-05',
      readTime: '7 min',
      category: 'Koop tips',
      image: '/blog/first-home-checklist.jpg'
    },
    {
      id: '6',
      title: 'Onderhandelen zonder makelaar: Do\'s en Don\'ts',
      excerpt: 'Praktische tips voor het onderhandelen over je droomhuis zonder tussenkomst van een makelaar.',
      author: 'Mark Janssen',
      date: '2024-12-03',
      readTime: '6 min',
      category: 'Koop tips',
      image: '/blog/negotiation-tips.jpg'
    },
    {
      id: '7',
      title: 'WOZ-waarde vs marktwaarde: Het verschil uitgelegd',
      excerpt: 'Waarom WOZ-waarde en marktwaarde verschillen en wat dit betekent voor je woningverkoop.',
      author: 'Lisa de Vries',
      date: '2024-11-28',
      readTime: '5 min',
      category: 'Inzichten',
      image: '/blog/woz-vs-market.jpg'
    },
    {
      id: '8',
      title: 'Vastgoeddata analyse: Amsterdam vs Rotterdam',
      excerpt: 'Vergelijkende analyse van de vastgoedmarkten in Amsterdam en Rotterdam met actuele cijfers.',
      author: 'Tom Bakker',
      date: '2024-11-25',
      readTime: '9 min',
      category: 'Data & Analyse',
      image: '/blog/amsterdam-rotterdam.jpg'
    },
    {
      id: '9',
      title: 'Juridische aspecten van particuliere verkoop',
      excerpt: 'Wat je moet weten over de juridische kant van het verkopen van je huis zonder makelaar.',
      author: 'Sarah van der Berg',
      date: '2024-11-22',
      readTime: '8 min',
      category: 'Verkoop tips',
      image: '/blog/legal-aspects.jpg'
    }
  ]

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      post.category.toLowerCase().replace(' ', '-') === selectedCategory.replace('-', ' ')
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

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
              OpenHaus Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ontdek de laatste vastgoed tips, markttrends en expert inzichten. 
              Alles wat je moet weten over het kopen en verkopen van huizen.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Zoek in blog artikelen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Button
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Post */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-video lg:aspect-auto bg-gray-200 flex items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                <div className="p-8">
                  <Badge className="mb-4 bg-blue-100 text-blue-800">
                    Uitgelicht
                  </Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 mb-6 text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredPost.date).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    Lees artikel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Blog Posts Grid */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredPosts.length} artikelen gevonden
            </h2>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Wis zoekopdracht
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs">
                      {post.category}
                    </Badge>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">
                        {new Date(post.date).toLocaleDateString('nl-NL')}
                      </span>
                      <Button variant="ghost" size="sm">
                        Lees meer
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Geen artikelen gevonden
                </h3>
                <p className="text-gray-600 mb-6">
                  Probeer een andere zoekopdracht of selecteer een andere categorie.
                </p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}>
                  Toon alle artikelen
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Newsletter Signup */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-green-900 mb-4">
                Blijf op de hoogte
              </h2>
              <p className="text-green-800 mb-6 max-w-2xl mx-auto">
                Ontvang wekelijks de nieuwste vastgoed inzichten, markttrends en tips 
                direct in je inbox. Geen spam, alleen waardevolle content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Je e-mailadres"
                  className="flex-1 bg-white border-green-200"
                />
                <Button className="bg-green-600 hover:bg-green-700">
                  Aanmelden
                </Button>
              </div>
              <p className="text-green-700 text-sm mt-4">
                Meer dan 5.000 vastgoed professionals ontvangen al onze nieuwsbrief
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Popular Topics */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Populaire Onderwerpen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { topic: 'Hypotheekrente', posts: 12 },
              { topic: 'Woningtaxatie', posts: 18 },
              { topic: 'Energielabels', posts: 8 },
              { topic: 'Markttrends', posts: 15 },
              { topic: 'Koop tips', posts: 22 },
              { topic: 'Verkoop tips', posts: 19 },
              { topic: 'Juridisch', posts: 11 },
              { topic: 'Financiering', posts: 14 }
            ].map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {topic.topic}
                    </h3>
                    <p className="text-gray-600">{topic.posts} artikelen</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}