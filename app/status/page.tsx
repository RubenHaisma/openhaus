"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Status | OpenHaus - Platform status en uptime',
  description: 'Bekijk de huidige status van het OpenHaus platform, uptime statistieken en eventuele onderhoudswerkzaamheden.',
  keywords: ['platform status', 'uptime', 'onderhoud', 'beschikbaarheid', 'service status']
}

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  uptime: number
  responseTime: number
  lastChecked: string
  description: string
  icon: React.ElementType
}

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const services: ServiceStatus[] = [
    {
      name: 'Website',
      status: 'operational',
      uptime: 99.98,
      responseTime: 245,
      lastChecked: '2 minuten geleden',
      description: 'Hoofdwebsite en gebruikersinterface',
      icon: Globe
    },
    {
      name: 'API Services',
      status: 'operational',
      uptime: 99.95,
      responseTime: 156,
      lastChecked: '1 minuut geleden',
      description: 'Backend API en data services',
      icon: Server
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      responseTime: 89,
      lastChecked: '30 seconden geleden',
      description: 'Primaire database en data opslag',
      icon: Database
    },
    {
      name: 'Zoekfunctie',
      status: 'operational',
      uptime: 99.92,
      responseTime: 312,
      lastChecked: '1 minuut geleden',
      description: 'Woningen zoeken en filteren',
      icon: Activity
    },
    {
      name: 'Betalingen',
      status: 'operational',
      uptime: 99.97,
      responseTime: 423,
      lastChecked: '3 minuten geleden',
      description: 'Betalingsverwerking en transacties',
      icon: Shield
    },
    {
      name: 'Email Service',
      status: 'operational',
      uptime: 99.94,
      responseTime: 1240,
      lastChecked: '5 minuten geleden',
      description: 'Email notificaties en communicatie',
      icon: Zap
    }
  ]

  const incidents = [
    {
      id: '1',
      title: 'Geplande database onderhoud',
      status: 'resolved',
      severity: 'maintenance',
      startTime: '2024-12-10 02:00',
      endTime: '2024-12-10 04:30',
      description: 'Routine database onderhoud voor performance optimalisatie',
      affectedServices: ['Database', 'API Services']
    },
    {
      id: '2',
      title: 'Tijdelijke vertraging in zoekresultaten',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-12-08 14:15',
      endTime: '2024-12-08 14:45',
      description: 'Verhoogde response tijd door hoog verkeer',
      affectedServices: ['Zoekfunctie']
    },
    {
      id: '3',
      title: 'Email notificaties vertraagd',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-12-05 09:30',
      endTime: '2024-12-05 11:15',
      description: 'Vertraging in email delivery door externe provider',
      affectedServices: ['Email Service']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200'
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'outage': return 'bg-red-100 text-red-800 border-red-200'
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operationeel'
      case 'degraded': return 'Verminderde prestaties'
      case 'outage': return 'Storing'
      case 'maintenance': return 'Onderhoud'
      default: return 'Onbekend'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'outage': return XCircle
      case 'maintenance': return Clock
      default: return AlertTriangle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'major': return 'bg-orange-100 text-orange-800'
      case 'minor': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const overallStatus = services.every(s => s.status === 'operational') ? 'operational' : 
                       services.some(s => s.status === 'outage') ? 'outage' : 'degraded'

  const averageUptime = services.reduce((sum, service) => sum + service.uptime, 0) / services.length

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setRefreshing(false)
    }, 1000)
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
              Platform Status
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Bekijk de huidige status van alle OpenHaus services en systemen. 
              We monitoren onze diensten 24/7 voor optimale beschikbaarheid.
            </p>
            
            {/* Overall Status */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'operational' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : overallStatus === 'outage' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {overallStatus === 'operational' ? 'Alle systemen operationeel' :
                   overallStatus === 'outage' ? 'Storing gedetecteerd' : 'Verminderde prestaties'}
                </span>
              </div>
              <Badge variant="outline">
                {averageUptime.toFixed(2)}% uptime
              </Badge>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <span>Laatst bijgewerkt: {lastUpdated.toLocaleTimeString('nl-NL')}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Vernieuwen
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Service Status */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Service Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status)
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <service.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{service.name}</h3>
                            <p className="text-gray-600 text-sm">{service.description}</p>
                          </div>
                        </div>
                        <StatusIcon className={`w-6 h-6 ${
                          service.status === 'operational' ? 'text-green-600' :
                          service.status === 'degraded' ? 'text-yellow-600' :
                          service.status === 'outage' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusText(service.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium text-gray-900">{service.uptime}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Response tijd:</span>
                          <span className="font-medium text-gray-900">{service.responseTime}ms</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Laatste check:</span>
                          <span className="text-gray-700 text-sm">{service.lastChecked}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Performance Overzicht
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">99.96%</div>
                <div className="text-gray-600">Uptime (30 dagen)</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">245ms</div>
                <div className="text-gray-600">Gem. response tijd</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">2.4M</div>
                <div className="text-gray-600">Requests (24u)</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-600">Actieve incidenten</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Recente Incidenten
          </h2>
          
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-bold text-lg text-gray-900">{incident.title}</h3>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity === 'critical' ? 'Kritiek' :
                             incident.severity === 'major' ? 'Groot' :
                             incident.severity === 'minor' ? 'Klein' : 'Onderhoud'}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Opgelost
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{incident.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Start:</span> {incident.startTime}
                          </div>
                          <div>
                            <span className="font-medium">Einde:</span> {incident.endTime}
                          </div>
                          <div>
                            <span className="font-medium">Duur:</span> 2u 30m
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700">Getroffen services: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {incident.affectedServices.map((service, serviceIndex) => (
                              <Badge key={serviceIndex} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Maintenance Schedule */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>Gepland Onderhoud</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Momenteel staat er geen gepland onderhoud op de agenda. Onderhoudswerkzaamheden 
                worden minimaal 48 uur van tevoren aangekondigd.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Onderhoud Beleid</h4>
                    <p className="text-blue-800 text-sm">
                      Routine onderhoud wordt uitgevoerd tijdens daluren (02:00 - 05:00 CET) 
                      om de impact op gebruikers te minimaliseren.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Subscribe to Updates */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Blijf op de hoogte
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ontvang automatische updates over de status van onze services
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                >
                  Abonneer op updates
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                >
                  RSS Feed
                </Button>
              </div>
              <p className="text-sm opacity-75 mt-4">
                Updates worden verstuurd bij incidenten en gepland onderhoud
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}