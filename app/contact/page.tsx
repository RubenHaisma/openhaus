"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  CheckCircle,
  Users,
  HelpCircle,
  Briefcase
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 1000)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@WattVrij.nl',
      description: 'We reageren binnen 24 uur',
      action: 'Email ons',
      href: 'mailto:info@WattVrij.nl'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      value: 'Direct beschikbaar',
      description: 'Ma-Vr 9:00-18:00',
      action: 'Start chat',
      href: '#'
    },
    {
      icon: MapPin,
      title: 'Kantoor',
      value: 'Herengracht 1, Amsterdam',
      description: 'Op afspraak',
      action: 'Plan bezoek',
      href: '#'
    }
  ]

  const departments = [
    {
      icon: Users,
      title: 'Klantenservice',
      email: 'support@WattVrij.nl',
      description: 'Algemene vragen en ondersteuning'
    },
    {
      icon: Briefcase,
      title: 'Partnerships',
      email: 'partnerships@WattVrij.nl',
      description: 'Zakelijke samenwerking en partnerships'
    },
    {
      icon: HelpCircle,
      title: 'Technische Support',
      email: 'tech@WattVrij.nl',
      description: 'Technische problemen en bugs'
    }
  ]

  const faqCategories = [
    {
      category: 'Verkopen',
      questions: [
        'Hoe bepaal ik de juiste verkoopprijs?',
        'Welke documenten heb ik nodig?',
        'Hoe lang duurt het verkoopproces?'
      ]
    },
    {
      category: 'Kopen',
      questions: [
        'Hoe maak ik een bod?',
        'Wat zijn de kosten voor de koper?',
        'Hoe regel ik een hypotheek?'
      ]
    },
    {
      category: 'Platform',
      questions: [
        'Hoe maak ik een account aan?',
        'Hoe upload ik foto\'s?',
        'Kan ik mijn advertentie bewerken?'
      ]
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-4"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Bedankt voor je bericht!
              </h1>
              
              <p className="text-gray-600 mb-6">
                We hebben je bericht ontvangen en zullen binnen 24 uur reageren. 
                Voor urgente vragen kun je ons bellen op 020 123 4567.
              </p>

              <Button onClick={() => setSubmitted(false)}>
                Nieuw bericht versturen
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

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
              Neem Contact Op
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Heb je vragen over vastgoed, ons platform of wil je gewoon even praten? 
              We helpen je graag verder met persoonlijke service.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Hoe Kun Je Ons Bereiken?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <method.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-900 font-medium mb-2">{method.value}</p>
                    <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={method.href}>{method.action}</a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Stuur ons een bericht</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Naam *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Onderwerp categorie</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="selling">Huis verkopen</SelectItem>
                        <SelectItem value="buying">Huis kopen</SelectItem>
                        <SelectItem value="technical">Technische ondersteuning</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="press">Pers & Media</SelectItem>
                        <SelectItem value="other">Anders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Onderwerp *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Bericht *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Versturen...' : 'Verstuur bericht'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Departments & FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Departments */}
            <Card>
              <CardHeader>
                <CardTitle>Directe Contacten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <dept.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{dept.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{dept.description}</p>
                      <a 
                        href={`mailto:${dept.email}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {dept.email}
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Veelgestelde Vragen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqCategories.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-bold text-gray-900 mb-2">{category.category}</h4>
                      <div className="space-y-1">
                        {category.questions.map((question, qIndex) => (
                          <div key={qIndex} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                            • {question}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/faq">Alle FAQ's bekijken</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Openingstijden</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maandag - Vrijdag</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zaterdag</span>
                    <span className="font-medium">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zondag</span>
                    <span className="font-medium">Gesloten</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Voor urgente zaken zijn we 24/7 bereikbaar via email
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}