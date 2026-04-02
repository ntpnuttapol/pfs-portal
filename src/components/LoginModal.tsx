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
        setError('รหัสผ่านไม่ตรงกัน')
        setIsLoading(false)
        return
      }

      try {
        const { error, pendingApproval, message } = await signUp(username, email, password, fullName)
        if (error) {
          setError(error.message || 'ไม่สามารถสร้างบัญชีได้')
        } else if (pendingApproval) {
          setSuccessMessage(message || 'ส่งคำขอสมัครใช้งานเรียบร้อยแล้ว กรุณารอผู้ดูแลอนุมัติ')
          setIsSignUp(false)
          resetForm()
        } else {
          setSuccessMessage('สร้างบัญชีเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ')
          setIsSignUp(false)
          resetForm()
        }
      } catch {
        setError('เกิดข้อผิดพลาดที่ไม่คาดคิด')
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        const { error } = await signIn(username, password)
        if (error) {
          setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        } else {
          resetForm()
          onClose()
          router.refresh()
        }
      } catch {
        setError('เกิดข้อผิดพลาดที่ไม่คาดคิด')
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
                    เข้าใช้งานอย่างปลอดภัย
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
                    {isSignUp ? 'ขอสิทธิ์ใช้งาน' : 'ยินดีต้อนรับกลับ'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    {isSignUp 
                      ? 'กรอกข้อมูลของคุณและรอผู้ดูแลอนุมัติก่อนเข้าสู่ระบบ' 
                      : 'ใช้บัญชีของคุณเพื่อเข้าสู่ระบบและไปยังแดชบอร์ด'}
                  </p>
                </div>

                <div className="mb-6 inline-flex rounded-full border border-card-border bg-background p-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleModeChange(false)}
                    className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-sm font-medium transition-colors ${!isSignUp ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange(true)}
                    className={`flex-1 sm:flex-none rounded-full px-4 py-2 text-sm font-medium transition-colors ${isSignUp ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    ขอสิทธิ์ใช้งาน
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
                            ชื่อ - นามสกุล
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                              className={inputClassName}
                              placeholder="ชื่อ - นามสกุล"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
                            อีเมล
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className={inputClassName}
                              placeholder="อีเมล"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
                      ชื่อผู้ใช้
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={inputClassName}
                        placeholder={isSignUp ? "ตั้งชื่อผู้ใช้" : "กรอกชื่อผู้ใช้"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-foreground/70 uppercase tracking-wider">
                      รหัสผ่าน
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
                        placeholder="กรอกรหัสผ่าน"
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
                        ยืนยันรหัสผ่าน
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
                          placeholder="กรอกรหัสผ่านอีกครั้ง"
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
                        {isSignUp ? 'ส่งคำขอใช้งาน' : 'เข้าสู่ระบบ'}
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
                        <h3 className="text-xs font-semibold text-foreground truncate">พร้อมใช้งาน SSO</h3>
                        <p className="text-[10px] text-foreground/50 leading-tight mt-0.5">เข้าสู่ระบบครั้งเดียว</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-background p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-foreground truncate">อนุมัติโดยผู้ดูแล</h3>
                        <p className="text-[10px] text-foreground/50 leading-tight mt-0.5">ควบคุมสิทธิ์อย่างปลอดภัย</p>
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
