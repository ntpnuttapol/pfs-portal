'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PortalGrid from '@/components/PortalGrid'
import { ArrowUpRight, BadgeCheck, KeyRound, Loader2, LogOut, Settings, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

const dashboardSupabase = createClient()

type UserSystemRole = {
  system_id: string
  role: string
}

const SYSTEM_META: Record<string, { label: string; description: string; accent: string; ssoReady?: boolean }> = {
  'hr-employee': {
    label: 'HR Employee',
    description: 'People, approvals, and employee health workflows.',
    accent: 'bg-sky-500/10 text-sky-600',
    ssoReady: true,
  },
  moldshop: {
    label: 'Moldshop',
    description: 'Maintenance, work orders, and mold operations.',
    accent: 'bg-indigo-500/10 text-indigo-600',
    ssoReady: true,
  },
  polyfoam: {
    label: 'Polyfoam',
    description: 'Core company tools and internal operations.',
    accent: 'bg-violet-500/10 text-violet-600',
  },
  booking: {
    label: 'Fleet Booking',
    description: 'Vehicle reservations and shared transport planning.',
    accent: 'bg-emerald-500/10 text-emerald-600',
  },
  moneytrack: {
    label: 'Money Track',
    description: 'Fuel, billing, and finance-related workflows.',
    accent: 'bg-amber-500/10 text-amber-600',
  },
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'border-purple-200 bg-purple-500/10 text-purple-600',
  editor: 'border-green-200 bg-green-500/10 text-green-600',
  viewer: 'border-blue-200 bg-blue-500/10 text-blue-600',
  none: 'border-card-border bg-foreground/5 text-foreground/50',
}

export default function DashboardPage() {
  const { user, isLoading, signOut, isAdmin, role, setIsLoginModalOpen } = useAuth()
  const router = useRouter()
  const [systemRoles, setSystemRoles] = useState<UserSystemRole[]>([])
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  useEffect(() => {
    if (!isLoading && !user) {
      setIsLoginModalOpen(true)
      router.push('/')
    }
  }, [isLoading, router, user, setIsLoginModalOpen])

  useEffect(() => {
    if (!user?.id) {
      return
    }

    let cancelled = false

    const fetchSystemRoles = async () => {
      const { data, error } = await dashboardSupabase
        .from('user_system_roles')
        .select('system_id, role')
        .eq('user_id', user.id)

      if (cancelled) {
        return
      }

      if (error) {
        console.error('System role lookup error:', error)
        setSystemRoles([])
      } else {
        setSystemRoles((data ?? []).filter((item) => item.role !== 'none'))
      }

      setLoadedUserId(user.id)
    }

    void fetchSystemRoles()

    return () => {
      cancelled = true
    }
  }, [user])

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'
  const accessLoading = !!user?.id && loadedUserId !== user.id

  const accessibleSystems = useMemo(
    () => {
      const currentSystemRoles = loadedUserId === user?.id ? systemRoles : []

      return currentSystemRoles.map((item) => {
        const meta = SYSTEM_META[item.system_id] ?? {
          label: item.system_id,
          description: 'Access is available for this connected system.',
          accent: 'bg-foreground/5 text-foreground/60',
        }

        return {
          ...item,
          ...meta,
        }
      })
    },
    [loadedUserId, systemRoles, user?.id]
  )

  const ssoReadyCount = accessibleSystems.filter((system) => system.ssoReady).length
  const quickLinks = isAdmin
    ? [
        {
          href: '/admin/user-approval',
          label: 'Review user approvals',
          description: 'Approve new registrations and assign the right access.',
        },
        {
          href: '/admin/sso-link',
          label: 'Manage SSO links',
          description: 'Keep hub accounts connected to downstream systems.',
        },
      ]
    : [
        {
          href: '/#portals',
          label: 'Browse all portals',
          description: 'Open the complete directory and search every available tool.',
        },
        {
          href: '/sso-docs',
          label: 'Read the SSO guide',
          description: 'See how connected systems validate and use access tokens.',
        },
      ]

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {/* Welcome Banner */}
      <section className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-card-border rounded-3xl p-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                    SSO Active
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/70 bg-foreground/5 px-2 py-1 rounded-md">
                    {roleLabel}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">
                  Welcome back, {displayName}
                </h2>
                <p className="text-foreground/60">
                  Your dashboard now highlights the systems and shortcuts most relevant to your current access.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    href="/admin/sso-link"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-card-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{accessibleSystems.length}</p>
                <p className="text-xs text-foreground/60">Connected systems</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-card-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{ssoReadyCount}</p>
                <p className="text-xs text-foreground/60">SSO-ready tools</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-card-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{roleLabel}</p>
                <p className="text-xs text-foreground/60">Current account role</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-card-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{quickLinks.length}</p>
                <p className="text-xs text-foreground/60">Suggested next steps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="max-w-7xl mx-auto grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Your access at a glance</h3>
                <p className="mt-1 text-sm text-foreground/60">
                  A personalized summary of the systems currently assigned to your account.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/60">
                {accessibleSystems.length} active assignments
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {accessLoading ? (
                <div className="flex items-center gap-3 rounded-3xl border border-card-border bg-background px-5 py-8 text-foreground/60">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading your assigned systems...
                </div>
              ) : accessibleSystems.length > 0 ? (
                accessibleSystems.map((system) => (
                  <div key={system.system_id} className="flex items-start gap-4 rounded-3xl border border-card-border bg-background p-4 shadow-sm">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${system.accent}`}>
                      {system.label.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold tracking-tight text-foreground">{system.label}</h4>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[system.role] ?? ROLE_STYLES.none}`}>
                          {system.role}
                        </span>
                        {system.ssoReady && (
                          <span className="rounded-full border border-green-200 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                            SSO Ready
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                        {system.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-card-border bg-background px-5 py-10 text-center">
                  <h4 className="text-lg font-semibold tracking-tight text-foreground">No system assignments yet</h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    Once your account is assigned to tools or SSO-enabled systems, they will appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold tracking-tight">Recommended next steps</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                {accessibleSystems.length > 0
                  ? 'Use these shortcuts to continue where you left off, then launch any connected system from the directory below.'
                  : 'Your access profile is still being prepared. Use these shortcuts to explore the hub while your assignments are being finalized.'}
              </p>

              <div className="mt-5 space-y-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-3xl border border-card-border bg-background px-4 py-4 transition hover:border-foreground/10 hover:bg-card"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/60">{item.description}</p>
                    </div>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-foreground/45" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold tracking-tight">Account snapshot</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-card-border bg-background px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">Email</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{user.email}</p>
                </div>
                <div className="rounded-2xl border border-card-border bg-background px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">Role</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{roleLabel}</p>
                </div>
                <div className="rounded-2xl border border-card-border bg-background px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">Top access</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accessibleSystems.length > 0 ? (
                      accessibleSystems.slice(0, 3).map((system) => (
                        <span key={system.system_id} className="rounded-full border border-card-border px-3 py-1.5 text-xs font-medium text-foreground/70">
                          {system.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-foreground/50">No systems assigned yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Same Portal Grid as Directory */}
      <PortalGrid
        sectionClassName="pb-12 px-6 bg-background"
        title="Launch directory"
        description="Search, filter, and open any connected or public portal from your central hub."
      />
    </div>
  )
}
