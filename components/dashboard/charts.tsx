"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension?: number
  }[]
}

interface DashboardChartsProps {
  timeRange: string
  userId: string
}

export function DashboardCharts({ timeRange, userId }: DashboardChartsProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData | null>(null)

  // Fetch real analytics data from API
  const fetchChartData = async (range: string): Promise<ChartData> => {
    try {
      const response = await fetch(`/api/users/${userId}/analytics?timeRange=${range}`)
      if (response.ok) {
        const data = await response.json()
        return data.chartData
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    }
    
    // Fallback to empty data
    return {
      labels: [],
      datasets: [
        {
          label: 'Weergaven',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Interesse',
          data: [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    }
  }

  useEffect(() => {
    setIsLoading(true)
    
    fetchChartData(timeRange).then(data => {
      setChartData(data)
      setIsLoading(false)
    })
  }, [timeRange, userId])

  // Simple SVG chart implementation
  const renderLineChart = () => {
    if (!chartData || chartData.datasets[0].data.length === 0) {
      return (
        <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 flex items-center justify-center">
          <p className="text-gray-500">Geen data beschikbaar</p>
        </div>
      )
    }
    
    const data = chartData.datasets[0].data
    const maxValue = Math.max(...data)
    const width = 400
    const height = 200
    const padding = 40

    const points = data.map((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
      const y = height - padding - ((value / maxValue) * (height - 2 * padding))
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (height - 2 * padding)) / 4}
              x2={width - padding}
              y2={padding + (i * (height - 2 * padding)) / 4}
              stroke="rgba(156, 163, 175, 0.3)"
              strokeWidth="1"
            />
          ))}

          {/* Chart line */}
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data points */}
          {data.map((value, index) => {
            const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
            const y = height - padding - ((value / maxValue) * (height - 2 * padding))
            return (
              <motion.circle
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                cx={x}
                cy={y}
                r="4"
                fill="rgb(59, 130, 246)"
                className="hover:r-6 transition-all cursor-pointer"
              />
            )
          })}

          {/* Labels */}
          {chartData.labels.map((label, index) => {
            const x = padding + (index * (width - 2 * padding)) / (chartData.labels.length - 1)
            return (
              <text
                key={index}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {label}
              </text>
            )
          })}
        </svg>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-800/50 rounded-xl pointer-events-none" />
      </div>
    )
  }

  const renderBarChart = () => {
    if (!chartData || chartData.datasets[0].data.length === 0) {
      return (
        <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center h-64">
          <p className="text-gray-500">Geen data beschikbaar</p>
        </div>
      )
    }
    
    const data = chartData.datasets[0].data
    const maxValue = Math.max(...data)

    return (
      <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
        {data.map((value, index) => (
          <motion.div
            key={index}
            initial={{ width: 0 }}
            animate={{ width: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {chartData.labels[index]}
            </span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: `${(value / maxValue) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <span className="text-xs font-medium text-white">{value}</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className="col-span-1 shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle>Prestatie overzicht</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Prestatie overzicht</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="h-8 px-3"
            >
              Lijn
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-8 px-3"
            >
              Staaf
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <motion.div
          key={`${chartType}-${timeRange}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {chartType === 'line' ? renderLineChart() : renderBarChart()}
        </motion.div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Weergaven</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Interesse</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}