"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  Settings,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  highlight: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welkom bij je WattVrij Dashboard! 🎉',
    description: 'Je persoonlijke controlecentrum voor al je vastgoedactiviteiten. Hier kun je je woningen beheren, prestaties bekijken en met kopers communiceren.',
    icon: Home,
    highlight: 'sidebar'
  },
  {
    id: 'properties',
    title: 'Beheer je woningen',
    description: 'Voeg nieuwe woningen toe, bewerk bestaande advertenties en volg de prestaties van je listings in real-time.',
    icon: Home,
    highlight: 'properties-tab'
  },
  {
    id: 'analytics',
    title: 'Inzicht in prestaties',
    description: 'Bekijk gedetailleerde analytics over weergaven, interesse en conversies om je verkoop te optimaliseren.',
    icon: BarChart3,
    highlight: 'analytics-tab'
  },
  {
    id: 'complete',
    title: 'Je bent klaar om te beginnen!',
    description: 'Ontdek alle functies van je dashboard en start met het verkopen van je woningen zonder makelaarskosten.',
    icon: Sparkles,
    highlight: 'overview'
  }
]

interface DashboardOnboardingProps {
  onComplete: () => void
}

export function DashboardOnboarding({ onComplete }: DashboardOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  const currentStepData = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Onboarding Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                {/* Close Button */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <currentStepData.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Stap {currentStep + 1} van {onboardingSteps.length}
                      </div>
                      <Progress value={progress} className="w-32 h-2 mt-1" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {currentStepData.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {currentStepData.description}
                    </p>
                  </div>

                  {/* Visual Indicator */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <currentStepData.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {currentStep === 0 && "Navigeer door je dashboard met de zijbalk"}
                          {currentStep === 1 && "Klik op 'Mijn woningen' om je advertenties te beheren"}
                          {currentStep === 2 && "Bekijk 'Analytics' voor gedetailleerde inzichten"}
                          {currentStep === 3 && "Start met het plaatsen van je eerste woning!"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentStep === 0 && "Alle belangrijke functies zijn gemakkelijk bereikbaar"}
                          {currentStep === 1 && "Upload foto's, bewerk beschrijvingen en volg prestaties"}
                          {currentStep === 2 && "Optimaliseer je advertenties met data-gedreven beslissingen"}
                          {currentStep === 3 && "Veel succes met het verkopen van je woning!"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Overslaan
                  </Button>

                  <div className="flex items-center space-x-3">
                    {/* Step Indicators */}
                    <div className="flex space-x-2">
                      {onboardingSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index <= currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNext}
                      className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {currentStep === onboardingSteps.length - 1 ? 'Beginnen' : 'Volgende'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Highlight Overlays */}
          {currentStepData.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-40"
            >
              {/* Add highlight effects based on currentStepData.highlight */}
              {currentStepData.highlight === 'sidebar' && (
                <div className="absolute left-0 top-0 w-80 h-full bg-white/10 border-2 border-primary/50 rounded-r-xl" />
              )}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}