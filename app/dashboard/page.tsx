"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  Home, 
  TrendingUp, 
  Calendar, 
  Euro, 
  Eye, 
  Heart, 
  Bell,
  Settings,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Users,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Moon,
  Sun,
  HelpCircle,
  Download,
  Upload,
  Trash2,
  Edit3,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { DashboardOnboarding } from '@/components/dashboard/onboarding'
import { DashboardCharts } from '@/components/dashboard/charts'
import { PropertyTable } from '@/components/dashboard/property-table'
import { NotificationCenter } from '@/components/dashboard/notification-center'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics'

// Mock data with realistic values
const mockDashboardData = {
  user: {
    name: 'Sarah van der Berg',
    email: 'sarah@example.com',
    avatar: '/avatars/sarah.jpg',
    role: 'SELLER',
    joinDate: '2024-01-15',
    totalEarnings: 875000,
    propertiesSold: 3,
    averageRating: 4.9
  },
  stats: {
    totalViews: 2847,
    totalFavorites: 156,
    activeListings: 2,
    completedSales: 3,
    totalRevenue: 875000,
    monthlyGrowth: 12.5,
    conversionRate: 8.3,
    averageTimeOnMarket: 18
  },
  properties: [
    {
      id: '1',
      address: 'Keizersgracht 123, Amsterdam',
      status: 'AVAILABLE',
      askingPrice: 875000,
      views: 145,
      favorites: 23,
      daysOnMarket: 12,
      images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      energyLabel: 'B',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      address: 'Herengracht 456, Amsterdam',
      status: 'PENDING',
      askingPrice: 650000,
      views: 89,
      favorites: 12,
      daysOnMarket: 8,
      images: ['https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg'],
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 95,
      energyLabel: 'A',
      createdAt: '2024-01-20T14:30:00Z'
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'view',
      message: 'Je woning op Keizersgracht kreeg 12 nieuwe weergaven',
      timestamp: '2024-01-25T10:30:00Z',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'favorite',
      message: '3 mensen hebben je woning als favoriet gemarkeerd',
      timestamp: '2024-01-25T09:15:00Z',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      id: '3',
      type: 'inquiry',
      message: 'Nieuwe vraag ontvangen over Herengracht 456',
      timestamp: '2024-01-24T16:45:00Z',
      icon: FileText,
      color: 'text-green-600'
    }
  ],
  notifications: [
    {
      id: '1',
      title: 'Nieuwe interesse',
      message: 'Je hebt 5 nieuwe bezichtigingsverzoeken',
      type: 'info',
      timestamp: '2024-01-25T10:30:00Z',
      read: false
    },
    {
      id: '2',
      title: 'Prijs suggestie',
      message: 'Overweeg een prijsaanpassing voor snellere verkoop',
      type: 'suggestion',
      timestamp: '2024-01-24T14:20:00Z',
      read: false
    }
  ]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [notifications, setNotifications] = useState(mockDashboardData.notifications)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  // Check for first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('dashboard-onboarding-completed')
    if (!hasSeenOnboarding && session) {
      setShowOnboarding(true)
    }
  }, [session])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/dashboard'))
      return
    }
  }, [session, status, router])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('dashboard-onboarding-completed', 'true')
  }

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
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SOLD': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Beschikbaar'
      case 'PENDING': return 'In behandeling'
      case 'SOLD': return 'Verkocht'
      default: return status
    }
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/40 rounded-full animate-ping mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dashboard laden...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We bereiden je persoonlijke dashboard voor
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!session) return null

  return (
    <>
      {/* Onboarding Flow */}
      <AnimatePresence>
        {showOnboarding && (
          <DashboardOnboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: sidebarCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col relative z-10"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">OpenHaus</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {[
                { id: 'overview', label: 'Overzicht', icon: BarChart3 },
                { id: 'properties', label: 'Mijn woningen', icon: Home },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'messages', label: 'Berichten', icon: FileText },
                { id: 'favorites', label: 'Favorieten', icon: Heart },
                { id: 'settings', label: 'Instellingen', icon: Settings }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.user?.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Welkom terug, {session.user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Hier is je dashboard overzicht voor vandaag
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Zoeken..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>

                  {/* Notifications */}
                  <NotificationCenter notifications={notifications} />

                  {/* Quick Actions */}
                  <QuickActions />
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          {
                            title: 'Totaal bekeken',
                            value: mockDashboardData.stats.totalViews.toLocaleString(),
                            change: '+12%',
                            icon: Eye,
                            color: 'text-blue-600',
                            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
                          },
                          {
                            title: 'Totale omzet',
                            value: formatPrice(mockDashboardData.stats.totalRevenue),
                            change: '+8%',
                            icon: DollarSign,
                            color: 'text-green-600',
                            bgColor: 'bg-green-100 dark:bg-green-900/20'
                          },
                          {
                            title: 'Actieve advertenties',
                            value: mockDashboardData.stats.activeListings.toString(),
                            change: '+2',
                            icon: Home,
                            color: 'text-purple-600',
                            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
                          },
                          {
                            title: 'Conversie ratio',
                            value: `${mockDashboardData.stats.conversionRate}%`,
                            change: '+1.2%',
                            icon: TrendingUp,
                            color: 'text-orange-600',
                            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
                          }
                        ].map((metric, index) => (
                          <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                          >
                            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      {metric.title}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                      {metric.value}
                                    </p>
                                    <div className="flex items-center mt-2">
                                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                                      <span className="text-sm text-green-600 font-medium">
                                        {metric.change}
                                      </span>
                                      <span className="text-sm text-gray-500 ml-1">vs vorige maand</span>
                                    </div>
                                  </div>
                                  <div className={`p-4 rounded-2xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                                  </div>
                                </div>
                                
                                {/* Animated background gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      {/* Charts and Analytics */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCharts timeRange={selectedTimeRange} />
                        <PerformanceMetrics data={mockDashboardData.stats} />
                      </div>

                      {/* Recent Activity & Quick Actions */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <RecentActivity activities={mockDashboardData.recentActivity} />
                        </div>
                        <div>
                          <Card className="h-full">
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <Zap className="w-5 h-5 text-primary" />
                                <span>Snelle acties</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Link href="/list-property">
                                <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                  <div className="flex items-center space-x-3">
                                    <Plus className="w-5 h-5" />
                                    <div className="text-left">
                                      <div className="font-semibold">Nieuwe woning</div>
                                      <div className="text-sm opacity-90">Plaats advertentie</div>
                                    </div>
                                  </div>
                                </Button>
                              </Link>

                              <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <BarChart3 className="w-5 h-5 text-blue-600" />
                                  <div className="text-left">
                                    <div className="font-semibold">Analytics bekijken</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Prestaties inzien</div>
                                  </div>
                                </div>
                              </Button>

                              <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <Download className="w-5 h-5 text-green-600" />
                                  <div className="text-left">
                                    <div className="font-semibold">Rapport downloaden</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Maandoverzicht</div>
                                  </div>
                                </div>
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'properties' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mijn woningen</h2>
                          <p className="text-gray-600 dark:text-gray-400">Beheer je advertenties en bekijk prestaties</p>
                        </div>
                        <Link href="/list-property">
                          <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Plus className="w-4 h-4 mr-2" />
                            Nieuwe woning
                          </Button>
                        </Link>
                      </div>

                      <PropertyTable 
                        properties={mockDashboardData.properties}
                        onEdit={(id) => console.log('Edit property:', id)}
                        onDelete={(id) => console.log('Delete property:', id)}
                        onView={(id) => router.push(`/properties/${id}`)}
                      />
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
                          <p className="text-gray-600 dark:text-gray-400">Gedetailleerde prestatie-inzichten</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exporteren
                          </Button>
                          <select 
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                          >
                            <option value="7d">Laatste 7 dagen</option>
                            <option value="30d">Laatste 30 dagen</option>
                            <option value="90d">Laatste 3 maanden</option>
                            <option value="1y">Laatste jaar</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCharts timeRange={selectedTimeRange} />
                        <PerformanceMetrics data={mockDashboardData.stats} />
                      </div>

                      {/* Detailed Analytics Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Bezoekers analyse</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Unieke bezoekers</span>
                                <span className="font-semibold">1,247</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Terugkerende bezoekers</span>
                                <span className="font-semibold">423</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Bounce rate</span>
                                <span className="font-semibold">32%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Conversie funnel</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Weergaven</span>
                                  <span>2,847</span>
                                </div>
                                <Progress value={100} className="h-2" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Interesse</span>
                                  <span>456</span>
                                </div>
                                <Progress value={16} className="h-2" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Contact</span>
                                  <span>89</span>
                                </div>
                                <Progress value={3.1} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Top bronnen</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {[
                                { source: 'Google Search', percentage: 45, visitors: 1280 },
                                { source: 'Direct', percentage: 28, visitors: 798 },
                                { source: 'Social Media', percentage: 18, visitors: 513 },
                                { source: 'Referrals', percentage: 9, visitors: 256 }
                              ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">{item.source}</span>
                                      <span className="text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                                    </div>
                                    <Progress value={item.percentage} className="h-1.5" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeTab === 'messages' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Berichten</h2>
                          <p className="text-gray-600 dark:text-gray-400">Communicatie met geïnteresseerde kopers</p>
                        </div>
                        <Button variant="outline">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </div>

                      <Card>
                        <CardContent className="p-8 text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Geen berichten
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Je hebt nog geen berichten ontvangen van geïnteresseerde kopers.
                          </p>
                          <Link href="/list-property">
                            <Button className="bg-primary hover:bg-primary/90">
                              Plaats je eerste woning
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'favorites' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Favorieten</h2>
                          <p className="text-gray-600 dark:text-gray-400">Woningen die je hebt opgeslagen</p>
                        </div>
                        <Link href="/buy">
                          <Button variant="outline">
                            <Search className="w-4 h-4 mr-2" />
                            Zoek woningen
                          </Button>
                        </Link>
                      </div>

                      <Card>
                        <CardContent className="p-8 text-center">
                          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Geen favorieten
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Je hebt nog geen woningen als favoriet gemarkeerd.
                          </p>
                          <Link href="/buy">
                            <Button className="bg-primary hover:bg-primary/90">
                              Ontdek woningen
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instellingen</h2>
                        <p className="text-gray-600 dark:text-gray-400">Beheer je account en voorkeuren</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Profiel instellingen</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Volledige naam
                              </label>
                              <Input defaultValue={session.user?.name || ''} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                E-mailadres
                              </label>
                              <Input defaultValue={session.user?.email || ''} />
                            </div>
                            <Button className="w-full">Opslaan</Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Notificatie voorkeuren</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {[
                              { label: 'E-mail notificaties', description: 'Ontvang updates via e-mail' },
                              { label: 'Push notificaties', description: 'Browser notificaties' },
                              { label: 'Marketing e-mails', description: 'Tips en aanbiedingen' },
                              { label: 'Wekelijkse rapporten', description: 'Prestatie overzichten' }
                            ].map((setting, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}