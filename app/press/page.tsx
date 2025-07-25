"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Newspaper, 
  Download, 
  Image, 
  Mail, 
  Calendar,
  ExternalLink,
  Award,
  TrendingUp,
  Users,
  Globe,
  Phone
} from 'lucide-react'
import { motion } from 'framer-motion'



export default function PressPage() {
  const pressReleases = [
    {
      id: '1',
      title: 'WattVrij breidt uit naar België en Duitsland',
      date: '2024-12-10',
      category: 'Bedrijfsnieuws',
      summary: 'WattVrij kondigt internationale expansie aan met lancering in België en Duitsland in Q2 2025.',
      downloadUrl: '/press/WattVrij-international-expansion-2024.pdf'
    },
    {
      id: '2',
      title: 'WattVrij wint PropTech Award 2024',
      date: '2024-11-15',
      category: 'Awards',
      summary: 'WattVrij ontvangt de prestigieuze PropTech Award voor beste innovatie in vastgoed technologie.',
      downloadUrl: '/press/WattVrij-proptech-award-2024.pdf'
    },
    {
      id: '3',
      title: '€12.5 miljoen bespaard voor Nederlandse huiseigenaren',
      date: '2024-10-22',
      category: 'Mijlpaal',
      summary: 'WattVrij bereikt belangrijke mijlpaal: meer dan €12.5 miljoen aan makelaarskosten bespaard.',
      downloadUrl: '/press/WattVrij-savings-milestone-2024.pdf'
    },
    {
      id: '4',
      title: 'Partnership met Nederlandse Hypotheek Maatschappij',
      date: '2024-09-18',
      category: 'Partnership',
      summary: 'Strategische samenwerking voor betere hypotheekdiensten aan WattVrij gebruikers.',
      downloadUrl: '/press/WattVrij-nhm-partnership-2024.pdf'
    },
    {
      id: '5',
      title: 'WattVrij haalt €15 miljoen op in Series B ronde',
      date: '2024-08-05',
      category: 'Financiering',
      summary: 'Succesvolle financieringsronde onder leiding van Accel Partners voor verdere groei.',
      downloadUrl: '/press/WattVrij-series-b-funding-2024.pdf'
    }
  ]

  const mediaKit = [
    {
      title: 'Logo Pack',
      description: 'Officiële WattVrij logo\'s in verschillende formaten',
      type: 'ZIP',
      size: '2.4 MB',
      downloadUrl: '/media/WattVrij-logo-pack.zip'
    },
    {
      title: 'Bedrijfsfoto\'s',
      description: 'High-resolution foto\'s van kantoor en team',
      type: 'ZIP',
      size: '15.8 MB',
      downloadUrl: '/media/WattVrij-photos.zip'
    },
    {
      title: 'Factsheet',
      description: 'Belangrijke feiten en cijfers over WattVrij',
      type: 'PDF',
      size: '1.2 MB',
      downloadUrl: '/media/WattVrij-factsheet.pdf'
    },
    {
      title: 'Presentatie Template',
      description: 'PowerPoint template met WattVrij branding',
      type: 'PPTX',
      size: '3.1 MB',
      downloadUrl: '/media/WattVrij-presentation-template.pptx'
    }
  ]

  const keyStats = [
    {
      label: 'Woningen verkocht',
      value: '2.847',
      icon: TrendingUp
    },
    {
      label: 'Actieve gebruikers',
      value: '25.000+',
      icon: Users
    },
    {
      label: 'Bespaard aan kosten',
      value: '€12.5M',
      icon: Award
    },
    {
      label: 'Steden actief',
      value: '50+',
      icon: Globe
    }
  ]

  const mediaContacts = [
    {
      name: 'Sarah van der Berg',
      role: 'CEO & Oprichter',
      email: 'sarah@WattVrij.nl',
      bio: 'Voormalig vastgoedmakelaar met 15 jaar ervaring. Oprichter van WattVrij in 2020.'
    },
    {
      name: 'Mark Janssen',
      role: 'CTO',
      email: 'mark@WattVrij.nl',
      bio: 'Tech expert gespecialiseerd in PropTech en AI-oplossingen voor vastgoed.'
    },
    {
      name: 'Lisa de Vries',
      role: 'Head of Communications',
      email: 'press@WattVrij.nl',
      bio: 'Verantwoordelijk voor alle externe communicatie en media relaties.'
    }
  ]

  const awards = [
    {
      year: '2024',
      award: 'PropTech Award - Beste Innovatie',
      organization: 'Dutch PropTech Association'
    },
    {
      year: '2024',
      award: 'FD Gazellen Award',
      organization: 'Het Financieele Dagblad'
    },
    {
      year: '2023',
      award: 'Startup van het Jaar',
      organization: 'TechLeap.nl'
    },
    {
      year: '2023',
      award: 'Best Customer Experience',
      organization: 'Real Estate Innovation Awards'
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
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Newspaper className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Pers & Media
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Persberichten, media resources en contact informatie voor journalisten. 
              Ontdek het laatste nieuws over WattVrij en onze impact op de vastgoedmarkt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                <Mail className="w-5 h-5 mr-2" />
                Media Contact
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3">
                <Download className="w-5 h-5 mr-2" />
                Download Media Kit
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Statistics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            WattVrij in Cijfers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {keyStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Press Releases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Recente Persberichten
          </h2>
          
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className="bg-blue-100 text-blue-800">
                            {release.category}
                          </Badge>
                          <span className="text-gray-500 text-sm">
                            {new Date(release.date).toLocaleDateString('nl-NL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {release.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{release.summary}</p>
                      </div>
                      <div className="mt-4 lg:mt-0 lg:ml-8">
                        <Button variant="outline" asChild>
                          <a href={release.downloadUrl} download>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Media Kit
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaKit.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Image className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-gray-500 text-sm">{item.size}</span>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={item.downloadUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Awards & Erkenning
          </h2>
          
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {awards.map((award, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{award.award}</h3>
                      
                      <p className="text-gray-600 text-sm">{award.organization}</p>
                      <p className="text-gray-500 text-sm">{award.year}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Media Contacts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Media Contacten
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mediaContacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {contact.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">{contact.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{contact.bio}</p>
                    <div className="space-y-2">
                      <a 
                        href={`mailto:${contact.email}`}
                        className="block text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Interview Requests */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-900 mb-4">
                  Interview Aanvragen
                </h2>
                <p className="text-green-800 mb-6 max-w-2xl mx-auto">
                  Wilt u een interview met onze CEO of andere woordvoerders? 
                  We staan open voor gesprekken over vastgoedtrends, PropTech innovaties en onze bedrijfsstrategie.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Calendar className="w-5 h-5 mr-2" />
                    Plan een interview
                  </Button>
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                    <Mail className="w-5 h-5 mr-2" />
                    Email ons
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Press Contact */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Perscontact
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Voor alle media gerelateerde vragen en interview aanvragen
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:press@WattVrij.nl"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary hover:bg-gray-100 rounded-lg text-lg font-bold transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  press@WattVrij.nl
                </a>
              </div>
              <p className="text-sm opacity-75 mt-4">
                We reageren binnen 4 uur op media aanvragen
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}