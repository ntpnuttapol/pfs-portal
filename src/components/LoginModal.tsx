'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  UserCircle, Lock, ArrowRight, Eye, EyeOff, Mail, 
  User, Shield, Sparkles, X, Loader2 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
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

  const resetForm = () => {
    setUsername('')
    setEmail('')
    setFullName('')
    setPassword('')
    setConfirmPassword('')
  }

  const inputClassName = 'w-full rounded-2xl border border-card-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10'
  const passwordInputClassName = 'w-full rounded-2xl border border-card-border bg-background py-3 pl-10 pr-12 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10'

  useEffect(() => {
    if (user && isOpen) {
      onClose()
      router.refresh()
    }
  }, [user, isOpen, onClose, router])

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleModeChange = (nextMode: boolean) => {
    setIsSignUp(nextMode)
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (isSignUp) {
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
          resetForm()
        } else {
          setSuccessMessage('Account created successfully! Please sign in.')
          setIsSignUp(false)
          resetForm()
        }
      } catch {
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        const { error } = await signIn(username, password)
        if (error) {
          setError('Invalid username or password')
        } else {
          resetForm()
          onClose()
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Centering wrapper */}
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-card-border bg-card shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
            >
              {/* Background elements */}
              <div className="absolute inset-0 bg-dot-pattern opacity-30 -z-10" />
              <div className="absolute left-[-10%] top-[-10%] h-40 w-40 rounded-full bg-foreground/5 blur-[60px] -z-10" />
              <div className="absolute right-[-10%] bottom-[-10%] h-40 w-40 rounded-full bg-blue-500/5 blur-[70px] -z-10" />

              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-background px-4 py-2 text-xs font-medium text-foreground/70 shadow-sm">
                    <Lock className="h-3.5 w-3.5" />
                    Secure hub access
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full border border-card-border bg-background p-2 text-foreground/40 transition hover:bg-foreground/5 hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {isSignUp ? 'Request access' : 'Welcome back'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    {isSignUp 
                      ? 'Submit your details and wait for admin approval before signing in.' 
                      : 'Use your hub credentials to continue to your dashboard.'}
                  </p>
                </div>

                <div className="mb-6 inline-flex rounded-full border border-card-border bg-background p-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleModeChange(false)}
                    className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-sm font-medium transition-colors ${!isSignUp ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange(true)}
                    className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-sm font-medium transition-colors ${isSignUp ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    Request Access
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                      {successMessage}
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
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
                              placeholder="Full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
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
                              placeholder="Email address"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
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
                        placeholder={isSignUp ? "Choose a username" : "Enter your username"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
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
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 transition hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
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
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? 'Submit access request' : 'Sign in to dashboard'}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                {!isSignUp && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-background p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-foreground truncate">SSO-ready</h3>
                        <p className="text-[10px] text-foreground/50 leading-tight mt-0.5">Unified login session</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-background p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-foreground truncate">Admin approved</h3>
                        <p className="text-[10px] text-foreground/50 leading-tight mt-0.5">Secure access control</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
