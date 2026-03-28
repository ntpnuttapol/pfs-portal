'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PortalGrid from '@/components/PortalGrid'
import { LogOut, Settings, Shield } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const { user, isLoading, signOut, isAdmin, role } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || ''
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'

  return (
    <div className="flex flex-col w-full">
      {/* User header — only when logged in */}
      {!isLoading && user && (
        <section className="pt-24 pb-2 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <span>{user.email}</span>
                    <span className="text-foreground/20">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin/sso-link"
                    className="flex items-center gap-1.5 rounded-full border border-card-border bg-card px-3.5 py-2 text-xs font-medium text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-full border border-card-border px-3.5 py-2 text-xs font-medium text-foreground/50 transition hover:bg-red-500/8 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Portal Grid */}
      <PortalGrid
        sectionClassName={`${!isLoading && user ? 'pt-6' : 'pt-28'} pb-16 px-6 bg-background`}
      />
    </div>
  )
}
