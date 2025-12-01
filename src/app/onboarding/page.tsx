'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingStep1Business } from '@/components/onboarding/Step1Business'
import { OnboardingStep2Outlet } from '@/components/onboarding/Step2Outlet'
import { OnboardingStep3Menu } from '@/components/onboarding/Step3Menu'
import { OnboardingStep4Theme } from '@/components/onboarding/Step4Theme'
import { OnboardingStep5Complete } from '@/components/onboarding/Step5Complete'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Business Info', description: 'Tell us about your business' },
  { id: 2, title: 'First Outlet', description: 'Set up your first location' },
  { id: 3, title: 'Menu Setup', description: 'Add your first menu items' },
  { id: 4, title: 'Customize', description: 'Brand your ordering page' },
  { id: 5, title: 'Complete', description: 'You are ready to go!' },
]

interface OnboardingData {
  business: {
    businessName?: string
    businessType?: string
    description?: string
    currency?: string
    timezone?: string
    storeId?: string
    storeSlug?: string
  }
  outlet: {
    outletName?: string
    outletCode?: string
    address?: string
    phone?: string
    taxPercentage?: number
    serviceChargePercentage?: number
    outletId?: string
    outletSlug?: string
  }
  menu: Array<{
    name: string
    price: number
    category: string
  }>
  theme: {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
    logoUrl?: string
    bannerUrl?: string
  }
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    business: {},
    outlet: {},
    menu: [],
    theme: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user has already completed onboarding
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status')
      if (response.ok) {
        const data = await response.json()
        if (data.onboardingCompleted) {
          router.push('/admin/dashboard')
          return
        }
        // Resume from last step
        if (data.onboardingStep > 0) {
          setCurrentStep(Math.min(data.onboardingStep + 1, STEPS.length))
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...stepData,
    }))

    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Steps indicator */}
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${currentStep > step.id
                      ? 'bg-emerald-500 text-white'
                      : currentStep === step.id
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 w-12 sm:w-20 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current step info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-gray-500 mt-1">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <OnboardingStep1Business
            data={onboardingData.business}
            onComplete={(data) => handleStepComplete({ business: data })}
          />
        )}
        {currentStep === 2 && (
          <OnboardingStep2Outlet
            data={onboardingData.outlet}
            onComplete={(data) => handleStepComplete({ outlet: data })}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <OnboardingStep3Menu
            data={onboardingData.menu}
            storeId={onboardingData.business.storeId}
            onComplete={(data) => handleStepComplete({ menu: data })}
            onSkip={() => setCurrentStep(4)}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <OnboardingStep4Theme
            data={onboardingData.theme}
            outletId={onboardingData.outlet.outletId}
            onComplete={(data) => handleStepComplete({ theme: data })}
            onBack={handleBack}
          />
        )}
        {currentStep === 5 && (
          <OnboardingStep5Complete
            data={onboardingData}
            onComplete={completeOnboarding}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}
