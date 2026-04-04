'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExternalLink, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Users,
  Settings,
  LineChart,
  Car,
  Fuel,
  Globe
} from 'lucide-react'

const SYSTEMS = [
  {
    id: 'hr-employee',
    title: 'Hr-employee',
    description: 'Human Resources and Employee Health management system.',
    url: 'http://localhost:3003/login', // เปลี่ยนเป็น port ที่ Hr-Employee รันอยู่
    category: 'system',
    icon: Users,
    status: 'active',
    requiresMapping: true,
  },
  {
    id: 'moldshop',
    title: 'Moldshop',
    description: 'Management system for mold maintenance and work orders.',
    url: 'https://moldshop.vercel.app/',
    category: 'system',
    icon: Settings,
    status: 'active',
    requiresMapping: true,
  },
  {
    id: 'project-finishing',
    title: 'Project-Finishing',
    description: 'Production monitoring and project finishing dashboard.',
    url: 'https://production-dashboard-pink.vercel.app/login',
    category: 'analytics',
    icon: LineChart,
    status: 'active',
    requiresMapping: true,
  },
  {
    id: 'booking',
    title: 'Car Booking',
    description: 'Vehicle and fleet reservation management.',
    url: 'https://pfs-bookingcar.vercel.app/',
    category: 'system',
    icon: Car,
    status: 'active',
    requiresMapping: true,
  },
  {
    id: 'moneybill-oil',
    title: 'Moneybill-Oil',
    description: 'Fuel tracking and financial billing system.',
    url: 'https://Polyfoampfs.com/moneytrack',
    category: 'system',
    icon: Fuel,
    status: 'active',
    requiresMapping: false,
  },
  {
    id: 'pfs-website',
    title: 'PFS Official Website',
    description: 'Visit our corporate website for more information.',
    url: 'https://www.pfs.co.th',
    category: 'external',
    icon: Globe,
    status: 'active',
    requiresMapping: false,
  }
]

const categoryColors: Record<string, string> = {
  system: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  analytics: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  external: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
}

export default function SSOPortalGrid() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  const handleAccessSystem = async (system: typeof SYSTEMS[0]) => {
    // External links don't need SSO
    if (system.category === 'external' || !system.requiresMapping) {
      window.open(system.url, '_blank')
      return
    }

    setLoadingId(system.id)
    setErrorId(null)

    try {
      // Call API to generate SSO token
      const response = await fetch('/api/sso/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemId: system.id,
          targetUrl: system.url,
          // Optional: Add user mapping if configured
          userMapping: {},
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate SSO token')
      }

      // Redirect to target system with token
      window.location.href = data.redirectUrl

    } catch (error) {
      console.error('SSO error:', error)
      setErrorId(system.id)
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {SYSTEMS.map((system, index) => {
        const Icon = system.icon
        const isLoading = loadingId === system.id
        const hasError = errorId === system.id

        return (
          <motion.div
            key={system.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <button
              onClick={() => handleAccessSystem(system)}
              disabled={isLoading}
              className={`w-full text-left bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group ${
                isLoading ? 'cursor-wait opacity-70' : ''
              } ${hasError ? 'border-red-300 dark:border-red-700' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${categoryColors[system.category]}`}>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : hasError ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {system.title}
                    </h4>
                    {system.requiresMapping && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {system.description}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[system.category]}`}>
                      {system.category}
                    </span>
                    {system.requiresMapping ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        SSO Ready
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Direct Link
                      </span>
                    )}
                  </div>
                </div>

                {!isLoading && !hasError && (
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                )}
              </div>

              {hasError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Failed to connect. Please try again or contact support.
                  </p>
                </div>
              )}
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
