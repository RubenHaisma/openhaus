"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddressInput } from '@/components/ui/address-input'
import { 
  Zap, 
  TrendingUp, 
  Euro, 
  Leaf, 
  Home, 
  Plus,
  BarChart3,
  Settings,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Fetch real user energy projects
  const { data: userProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['user-projects', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { projects: [] }
      const response = await fetch(`/api/users/${session.user.id}/energy-projects`)
      if (!response.ok) throw new Error('Failed to fetch projects')
      return response.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Calculate stats from real user projects
  const stats = {
    totalSavings: userProjects?.projects?.reduce((sum: number, p: any) => sum + (p.annualSavings || 0), 0) || 0,
    totalSubsidy: userProjects?.projects?.reduce((sum: number, p: any) => sum + (p.subsidyAmount || 0), 0) || 0,
    activeProjects: userProjects?.projects?.filter((p: any) => p.status === 'IN_PROGRESS').length || 0,
    co2Reduction: userProjects?.projects?.reduce((sum: number, p: any) => sum + (p.co2Reduction || 0), 0) || 0,
  }

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/dashboard'))
      return
    }
  }, [session, status, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'Planning'
      case 'IN_PROGRESS': return 'In uitvoering'
      case 'COMPLETED': return 'Voltooid'
      default: return status
    }
  }

  // Handle address search for new energy assessment
  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      // Get energy assessment first
      const res = await fetch('/api/energy/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, postalCode }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Redirect to energy plan with assessment data
        router.push(`/energy-plan?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}`)
      } else {
        const errorData = await res.json()
        alert(`Fout bij het ophalen van energiegegevens: ${errorData.error}`)
      }
    } catch (error: any) {
      alert(`Fout bij het ophalen van energiegegevens: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welkom terug, {session.user?.name?.split(' ')[0]}! 🌱
          </h1>
          <p className="text-gray-600">
            Beheer je energieprojecten en volg je voortgang naar energieneutraliteit
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Jaarlijkse besparing',
              value: formatPrice(stats.totalSavings),
              icon: Euro,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            },
            {
              label: 'Ontvangen subsidie',
              value: formatPrice(stats.totalSubsidy),
              icon: TrendingUp,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100'
            },
            {
              label: 'Actieve projecten',
              value: stats.activeProjects.toString(),
              icon: Zap,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100'
            },
            {
              label: 'CO₂ reductie',
              value: `${stats.co2Reduction} kg/jaar`,
              icon: Leaf,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add New Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  <span>Nieuwe energieanalyse</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Voer het adres van een woning in om een gratis energieanalyse te starten
                </p>
                <AddressInput
                  onSearch={handleAddressSearch}
                  placeholder="Voer adres in voor energieanalyse..."
                  className="w-full"
                  loading={loading}
                />
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Automatische analyse</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Euro className="w-4 h-4" />
                    <span>Subsidie check</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Installateur matching</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Home className="w-5 h-5 text-green-600" />
                    <span>Mijn energieprojecten ({userProjects?.projects?.length || 0})</span>
                  </CardTitle>
                  {userProjects?.projects?.length > 0 && (
                    <Button variant="outline" size="sm">
                      Alles beheren
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : !userProjects?.projects?.length ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nog geen energieprojecten
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start je eerste energieanalyse om te ontdekken hoe je kunt besparen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProjects.projects.slice(0, 3).map((project: any) => (
                      <div key={project.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {project.energySavings}% besparing
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDate(project.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatPrice(project.subsidyAmount)}
                          </div>
                          <div className="text-sm text-gray-600">subsidie</div>
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm" className="mt-2">
                              Bekijk
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {userProjects.projects.length > 3 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          Bekijk alle {userProjects.projects.length} projecten
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Snelle acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/subsidies">
                  <Button variant="outline" className="w-full justify-start">
                    <Euro className="w-4 h-4 mr-2" />
                    Bekijk subsidies
                  </Button>
                </Link>
                <Link href="/installateurs">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Vind installateurs
                  </Button>
                </Link>
                <Link href="/calculator">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    ROI calculator
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-600">{session.user?.email}</p>
                  </div>
                </div>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Instellingen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Energy Transition Progress */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-900 mb-2">
                  2030 Voortgang
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  Nederland moet in 2030 energieneutraal zijn. Zie hoe je bijdraagt.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Jouw CO₂ reductie</span>
                    <span className="font-medium text-green-900">{stats.co2Reduction} kg/jaar</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Energiebesparing</span>
                    <span className="font-medium text-green-900">{formatPrice(stats.totalSavings)}/jaar</span>
                  </div>
                </div>
                <Link href="/compliance">
                  <Button variant="outline" size="sm" className="w-full mt-4 border-green-300 text-green-700 hover:bg-green-100">
                    Bekijk compliance
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}