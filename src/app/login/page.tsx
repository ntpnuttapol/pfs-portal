'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { UserCircle, Lock, ArrowRight, Eye, EyeOff, Mail, User, Shield, Sparkles, LayoutDashboard } from 'lucide-react'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn, signUp, user } = useAuth()
  const inputClassName = 'w-full rounded-2xl border border-card-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10'
  const passwordInputClassName = 'w-full rounded-2xl border border-card-border bg-background py-3 pl-10 pr-12 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10'

  const handleModeChange = (nextMode: boolean) => {
    setIsSignUp(nextMode)
    setError('')
    setSuccessMessage('')
  }

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (isSignUp) {
      // Sign Up
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      try {
        const { error, pendingApproval, message } = await signUp(username, email, password, fullName)
        if (error) {
          setError(error.message || 'Failed to create account')
        } else if (pendingApproval) {
          setSuccessMessage(message || 'Your registration request has been submitted and is pending admin approval.')
          setIsSignUp(false)
        } else {
          setSuccessMessage('Account created successfully! Please sign in.')
          setIsSignUp(false)
        }
      } catch {
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Sign In
      try {
        const { error } = await signIn(username, password)
        if (error) {
          setError('Invalid username or password')
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      } catch {
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="relative overflow-hidden px-6 pb-16 pt-28">
      <div className="absolute inset-0 bg-dot-pattern opacity-50 -z-10" />
      <div className="absolute left-[5%] top-12 h-72 w-72 rounded-full bg-foreground/5 blur-[110px] -z-10" />
      <div className="absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-blue-500/10 blur-[140px] -z-10" />

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-card-border bg-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-background px-4 py-2 text-sm font-medium text-foreground/70 shadow-sm">
            <Lock className="h-4 w-4" />
            Secure hub access
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {isSignUp ? 'Request access to every essential system.' : 'Sign in once and launch every portal from one place.'}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/60 md:text-lg">
            Use the same polished hub experience to access internal tools, connected dashboards, and SSO-enabled systems without jumping between separate login screens.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-card-border bg-background p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">Unified directory</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                Browse every connected portal from a single, organized workspace.
              </p>
            </div>

            <div className="rounded-3xl border border-card-border bg-background p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">SSO-ready access</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                Launch supported systems faster with a single sign-in session.
              </p>
            </div>

            <div className="rounded-3xl border border-card-border bg-background p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">Guided approval</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                New account requests stay controlled through the admin approval flow.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-card-border bg-background p-5 shadow-sm">
            <p className="text-sm font-medium text-foreground/70">Need a quick overview first?</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
              You can always return to the public directory to explore the available systems before signing in.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-card-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card"
            >
              Browse the portal directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-card-border bg-card p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] lg:p-8">
          <div className="inline-flex rounded-full border border-card-border bg-background p-1">
            <button
              type="button"
              onClick={() => handleModeChange(false)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${!isSignUp ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(true)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${isSignUp ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Request Access
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? 'Create your access request' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
              {isSignUp ? 'Submit your details and wait for admin approval before signing in.' : 'Use your hub credentials to continue to your personalized dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/70">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={inputClassName}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/70">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClassName}
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/70">
                Username
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={inputClassName}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/70">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={passwordInputClassName}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground/70">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className={passwordInputClassName}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Submit Request' : 'Sign In to Dashboard'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4 text-center">
            <div className="text-sm text-foreground/60">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => handleModeChange(!isSignUp)}
                className="font-medium text-foreground transition hover:opacity-70"
              >
                {isSignUp ? 'Switch to Sign In' : 'Request Access'}
              </button>
            </div>

            <Link
              href="/"
              className="block text-sm text-foreground/50 transition hover:text-foreground"
            >
              ← Back to Portal Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
