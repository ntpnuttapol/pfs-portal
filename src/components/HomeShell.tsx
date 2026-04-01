'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, LogOut, Settings, Shield } from 'lucide-react'
import Hero from '@/components/Hero'
import PortalGrid from '@/components/PortalGrid'
import { useAuth } from '@/contexts/AuthContext'

export default function HomeShell() {
  const { user, signOut, isAdmin, role } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    ''
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'

  return (
    <div className="flex flex-col w-full">
      {!user ? (
        <Hero />
      ) : (
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
                  type="button"
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

      <PortalGrid sectionClassName={`${user ? 'pt-6' : 'pt-4'} pb-16 px-6 bg-background`} />

      {!user && (
        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-card-border bg-card p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                Internal Access Hub
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Manage business systems, access requests, and SSO handoff in one place
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
                PFS Portal acts as the public-facing directory and launchpad for
                Polyfoam Suvarnabhumi teams. Users can review available tools,
                sign in with hub credentials, request new access, and move into
                connected systems through a single sign-on workflow when mapping
                is enabled.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-card-border bg-background p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Portal directory
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    Browse HR, production, fleet, finance, and company resources
                    from one searchable list.
                  </p>
                </div>
                <div className="rounded-3xl border border-card-border bg-background p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Approval workflow
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    New accounts follow an approval-based onboarding flow so
                    internal access can stay controlled and auditable.
                  </p>
                </div>
                <div className="rounded-3xl border border-card-border bg-background p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    SSO-ready systems
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    Connected applications can receive short-lived hub tokens and
                    create local sessions with less friction for users.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-card-border bg-card p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                Public FAQ
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Common questions about PFS Portal
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-card-border bg-background p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    What is PFS Portal used for?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    It is a centralized directory for internal systems, public
                    resources, and SSO-enabled launch flows used across
                    Polyfoam Suvarnabhumi.
                  </p>
                </div>
                <div className="rounded-3xl border border-card-border bg-background p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Can users request access from the portal?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    Yes. New users can submit a request for approval before they
                    get access to protected systems and dashboard workflows.
                  </p>
                </div>
                <div className="rounded-3xl border border-card-border bg-background p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Where can developers read about the SSO flow?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    The public SSO documentation explains token validation, user
                    mapping, and the expected integration steps for connected
                    applications.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/sso-docs"
                  className="inline-flex items-center gap-2 rounded-full border border-card-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                >
                  Read SSO docs
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Sign in or request access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
