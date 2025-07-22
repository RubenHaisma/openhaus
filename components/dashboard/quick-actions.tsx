"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Zap, 
  BarChart3, 
  Download, 
  Settings,
  MessageSquare,
  Upload,
  Share2
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      id: 'new-property',
      label: 'Nieuwe woning',
      description: 'Plaats een nieuwe advertentie',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/list-property'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Bekijk prestaties',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Analytics')
    },
    {
      id: 'download-report',
      label: 'Rapport downloaden',
      description: 'Maandoverzicht',
      icon: Download,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('Download report')
    },
    {
      id: 'bulk-upload',
      label: 'Bulk upload',
      description: 'Meerdere woningen',
      icon: Upload,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Bulk upload')
    },
    {
      id: 'share-listing',
      label: 'Deel advertentie',
      description: 'Social media',
      icon: Share2,
      color: 'bg-pink-500 hover:bg-pink-600',
      action: () => console.log('Share listing')
    },
    {
      id: 'settings',
      label: 'Instellingen',
      description: 'Account beheren',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => console.log('Settings')
    }
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Zap className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-0">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Snelle acties</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Veelgebruikte functies</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {action.href ? (
                    <Link href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-white transition-colors`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">{action.label}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{action.description}</div>
                        </div>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        action.action?.()
                        setIsOpen(false)
                      }}
                    >
                      <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-white transition-colors`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{action.description}</div>
                      </div>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}