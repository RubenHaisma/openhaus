"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp,
  User,
  Clock,
  ExternalLink
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  icon: React.ElementType
  color: string
  metadata?: any
}

interface RecentActivityProps {
  userId: string
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real activity data from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/activities`)
        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchActivities()
    }
  }, [userId])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Nu'
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}u geleden`
    return `${Math.floor(diffInMinutes / 1440)}d geleden`
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
      case 'favorite': return 'bg-red-100 text-red-600 dark:bg-red-900/20'
      case 'inquiry': return 'bg-green-100 text-green-600 dark:bg-green-900/20'
      case 'message': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20'
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Recente activiteit</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            Alles bekijken
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-gray-600">Laden van activiteit...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Geen recente activiteit
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Activiteit verschijnt hier zodra er interactie is met je advertenties
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  {/* Activity Icon */}
                  <div className={`p-2 rounded-xl ${getActivityTypeColor(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
                    <activity.icon className="w-4 h-4" />
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                          {activity.message}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type === 'view' && 'Weergave'}
                            {activity.type === 'favorite' && 'Favoriet'}
                            {activity.type === 'inquiry' && 'Vraag'}
                            {activity.type === 'message' && 'Bericht'}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Additional Metadata */}
                    {activity.metadata && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {activities.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button variant="outline" size="sm" className="w-full">
              Meer activiteit laden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}