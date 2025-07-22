"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart,
  MessageSquare,
  Users,
  Clock,
  DollarSign
} from 'lucide-react'

interface PerformanceData {
  totalViews: number
  totalFavorites: number
  activeListings: number
  completedSales: number
  totalRevenue: number
  monthlyGrowth: number
  conversionRate: number
  averageTimeOnMarket: number
}

interface PerformanceMetricsProps {
  data: PerformanceData
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = [
    {
      label: 'Conversie ratio',
      value: data.conversionRate,
      target: 10,
      unit: '%',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Maandelijkse groei',
      value: data.monthlyGrowth,
      target: 15,
      unit: '%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Gem. tijd op markt',
      value: data.averageTimeOnMarket,
      target: 30,
      unit: ' dagen',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      inverse: true // Lower is better
    },
    {
      label: 'Interesse ratio',
      value: (data.totalFavorites / data.totalViews) * 100,
      target: 8,
      unit: '%',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ]

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`
  }

  const getPerformanceStatus = (value: number, target: number, inverse = false) => {
    const percentage = inverse ? (target / value) * 100 : (value / target) * 100
    
    if (percentage >= 100) return { status: 'excellent', color: 'text-green-600' }
    if (percentage >= 80) return { status: 'good', color: 'text-blue-600' }
    if (percentage >= 60) return { status: 'average', color: 'text-yellow-600' }
    return { status: 'poor', color: 'text-red-600' }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary" />
          <span>Prestatie indicatoren</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const performance = getPerformanceStatus(metric.value, metric.target, metric.inverse)
            const progressValue = metric.inverse 
              ? Math.min(100, (metric.target / metric.value) * 100)
              : Math.min(100, (metric.value / metric.target) * 100)

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {metric.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Doel: {formatValue(metric.target, metric.unit)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${performance.color} border-current`}
                    >
                      {performance.status === 'excellent' && 'Uitstekend'}
                      {performance.status === 'good' && 'Goed'}
                      {performance.status === 'average' && 'Gemiddeld'}
                      {performance.status === 'poor' && 'Onder verwachting'}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Voortgang naar doel</span>
                    <span>{progressValue.toFixed(0)}%</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <Progress 
                      value={progressValue} 
                      className="h-2"
                    />
                  </motion.div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center space-x-2 text-sm">
                  {metric.value > metric.target * 0.8 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Op koers</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Verbetering nodig</span>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Prestatie samenvatting
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.filter(m => getPerformanceStatus(m.value, m.target, m.inverse).status === 'excellent').length} van {metrics.length} doelen behaald
              </p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}