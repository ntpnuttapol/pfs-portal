'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type AdminAlertTone = 'success' | 'error' | 'info'

type AdminLoadingStateProps = {
  title?: string
  description?: string
}

type AdminAlertProps = {
  tone?: AdminAlertTone
  title?: string
  description: string
  action?: ReactNode
}

type AdminEmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

type AdminAccessDeniedProps = {
  signedIn?: boolean
  title?: string
  description?: string
}

const alertStyles: Record<AdminAlertTone, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-card-border bg-card text-foreground/75',
}

export function AdminLoadingState({
  title = 'Loading admin workspace',
  description = 'Preparing the latest data and permissions for this page.',
}: AdminLoadingStateProps) {
  return (
    <div className="rounded-3xl border border-card-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-foreground/60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foreground/60">{description}</p>
    </div>
  )
}

export function AdminAlert({ tone = 'info', title, description, action }: AdminAlertProps) {
  return (
    <div className={`rounded-2xl border px-4 py-4 shadow-sm ${alertStyles[tone]}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <p className="text-sm font-semibold">{title}</p>}
          <p className={`text-sm leading-relaxed ${title ? 'mt-1' : ''}`}>{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

export function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-card-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-foreground/35">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foreground/60">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function AdminAccessDenied({
  signedIn = false,
  title = 'You do not have access to this admin page',
  description = 'This area is reserved for administrators. Please sign in with the correct account or return to the main dashboard.',
}: AdminAccessDeniedProps) {
  const { setIsLoginModalOpen } = useAuth()

  return (
    <div className="rounded-3xl border border-card-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foreground/60">{description}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {signedIn ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Sign in
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-card-border px-4 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-background hover:text-foreground"
        >
          <AlertTriangle className="h-4 w-4" />
          Return to directory
        </Link>
      </div>
    </div>
  )
}
