'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  forceChange?: boolean
}

export default function ChangePasswordModal({ isOpen, onClose, forceChange = false }: ChangePasswordModalProps) {
  const { changePassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const inputClassName =
    'w-full rounded-2xl border border-card-border bg-background py-3 pl-10 pr-12 text-sm text-foreground outline-none transition focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10'

  const resetForm = () => {
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setError('')
    setSuccessMessage('')
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return
    }

    document.body.style.overflow = 'unset'
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    if (forceChange && !successMessage) {
      return
    }

    resetForm()
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (newPassword.length < 8) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await changePassword(newPassword)

      if (error) {
        setError(error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
        return
      }

      setSuccessMessage('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
      setNewPassword('')
      setConfirmPassword('')

      if (forceChange) {
        window.setTimeout(() => {
          handleClose()
        }, 700)
      }
    } catch {
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={forceChange ? undefined : handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.24 }}
              className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-card-border bg-card shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
            >
              <div className="absolute inset-0 bg-dot-pattern opacity-30 -z-10" />
              <div className="absolute left-[-10%] top-[-10%] h-36 w-36 rounded-full bg-foreground/5 blur-[60px] -z-10" />
              <div className="absolute right-[-10%] bottom-[-10%] h-36 w-36 rounded-full bg-emerald-500/5 blur-[70px] -z-10" />

              <div className="p-8 sm:p-9">
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-background px-4 py-2 text-xs font-medium text-foreground/70 shadow-sm">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    เปลี่ยนรหัสผ่านด้วย session ปัจจุบัน
                  </div>
                  {!forceChange && (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full border border-card-border bg-background p-2 text-foreground/40 transition hover:bg-foreground/5 hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {forceChange ? 'ตั้งรหัสผ่านใหม่' : 'เปลี่ยนรหัสผ่าน'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    {forceChange
                      ? 'บัญชีนี้ใช้รหัสชั่วคราวจากผู้ดูแลอยู่ กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งานต่อ'
                      : 'คุณไม่จำเป็นต้องกรอกรหัสผ่านเดิม ระบบจะยืนยันจากการเข้าสู่ระบบปัจจุบันของคุณ'}
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground/70">
                      รหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                        minLength={8}
                        className={inputClassName}
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 transition hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground/70">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        minLength={8}
                        className={inputClassName}
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 transition hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-card-border bg-background px-4 py-3 text-xs leading-relaxed text-foreground/55">
                    หลังเปลี่ยนรหัสผ่านแล้ว การเข้าสู่ระบบครั้งถัดไปให้ใช้รหัสผ่านใหม่กับ Hub และระบบที่เชื่อมผ่านบัญชีนี้
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    {!forceChange && (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center rounded-full border border-card-border px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background"
                      >
                        ยกเลิก
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${forceChange ? 'w-full' : 'flex-1'}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          กำลังบันทึก
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" />
                          บันทึกรหัสผ่านใหม่
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
