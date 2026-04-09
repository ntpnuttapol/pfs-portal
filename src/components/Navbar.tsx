'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { User, Settings, Users, UserCog, Menu, X, ChevronDown, LogOut, LogIn, KeyRound } from 'lucide-react'
import LoginModal from './LoginModal'
import ChangePasswordModal from './ChangePasswordModal'

const adminLinks = [
  { href: '/admin/user-approval', label: 'อนุมัติผู้ใช้', icon: Users },
  { href: '/admin/user-management', label: 'จัดการผู้ใช้', icon: UserCog },
  { href: '/admin/sso-link', label: 'เชื่อมบัญชี SSO', icon: Settings },
]

const USER_APPROVAL_PATH = '/admin/user-approval'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, isAdmin, mustChangePassword, signOut, isLoginModalOpen, setIsLoginModalOpen } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  const linkClassName = (active: boolean) =>
    `rounded-full px-3 py-2 transition-colors ${active ? 'bg-foreground text-background' : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'}`

  const pendingApprovalLabel = pendingApprovalCount > 99 ? '99+' : `${pendingApprovalCount}`

  const fetchPendingApprovalCount = useCallback(async () => {
    if (!user || !isAdmin) {
      setPendingApprovalCount(0)
      return
    }

    try {
      const response = await fetch('/api/admin/user-requests', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch approval requests')
      }

      const nextCount = Array.isArray(data.requests)
        ? data.requests.filter((request: { status?: string }) => request.status === 'pending').length
        : 0

      setPendingApprovalCount(nextCount)
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error)
    }
  }, [isAdmin, user])

  const handleSignOut = async () => {
    setIsAdminMenuOpen(false)
    setIsMobileMenuOpen(false)
    await signOut()
    router.push('/')
  }

  const handleOpenChangePassword = () => {
    setIsAdminMenuOpen(false)
    setIsMobileMenuOpen(false)
    setIsChangePasswordOpen(true)
  }

  useEffect(() => {
    void fetchPendingApprovalCount()
  }, [fetchPendingApprovalCount])

  useEffect(() => {
    if (!user || !isAdmin) {
      return
    }

    const intervalId = window.setInterval(() => {
      void fetchPendingApprovalCount()
    }, 30000)

    const handleWindowFocus = () => {
      void fetchPendingApprovalCount()
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [fetchPendingApprovalCount, isAdmin, user])

  useEffect(() => {
    if (user && mustChangePassword) {
      setIsChangePasswordOpen(true)
    }
  }, [mustChangePassword, user])

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/70 px-6 py-4 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex w-full items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center space-x-2 group"
          onClick={() => {
            setIsAdminMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        >
          <div className="bg-foreground text-background overflow-hidden p-0 rounded-xl group-hover:scale-105 transition-transform w-10 h-10 flex items-center justify-center">
            <Image
              src="/pfslogo.png"
              alt="PFS Logo"
              width={40}
              height={40}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight">Polyfoam Suvarnabhumi</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <Link href="/#portals" className={linkClassName(pathname === '/')}>
            ระบบ
          </Link>
          <Link href="/#about" className={linkClassName(false)}>
            วิธีใช้งาน
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm font-medium">
          {isLoading ? (
            <>
              <div className="h-10 w-24 rounded-full bg-foreground/10 animate-pulse" />
              <div className="h-10 w-36 rounded-full bg-foreground/10 animate-pulse" />
            </>
          ) : user ? (
            <>
              {isAdmin && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAdminMenuOpen((current) => !current)}
                    aria-controls="admin-menu"
                    aria-expanded={isAdminMenuOpen}
                    aria-haspopup="menu"
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${pathname.startsWith('/admin') || isAdminMenuOpen ? 'border-foreground/10 bg-foreground text-background' : 'border-card-border bg-card text-foreground hover:bg-background'}`}
                  >
                    <Settings className="h-4 w-4" />
                    ผู้ดูแล
                    {pendingApprovalCount > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                        {pendingApprovalLabel}
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAdminMenuOpen && (
                    <div id="admin-menu" role="menu" className="absolute right-0 top-full mt-3 w-60 rounded-3xl border border-card-border bg-card p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                      {adminLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsAdminMenuOpen(false)}
                          role="menuitem"
                          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors ${pathname === href ? 'bg-foreground text-background' : 'text-foreground/75 hover:bg-background hover:text-foreground'}`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </span>
                          {href === USER_APPROVAL_PATH && pendingApprovalCount > 0 && (
                            <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${pathname === href ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                              {pendingApprovalLabel}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-full border border-card-border bg-card px-4 py-2 text-foreground/60 shadow-sm">
                <User className="h-4 w-4" />
                <span className="max-w-[180px] truncate">{user.email}</span>
              </div>

              <button
                type="button"
                onClick={handleOpenChangePassword}
                className="flex items-center gap-2 rounded-full border border-card-border px-4 py-2 text-foreground/70 transition-colors hover:bg-background"
              >
                <KeyRound className="h-4 w-4" />
                เปลี่ยนรหัสผ่าน
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-full border border-card-border px-4 py-2 text-foreground/70 transition-colors hover:bg-foreground hover:text-background"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-foreground text-background px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-semibold"
            >
              <LogIn className="h-4 w-4" />
              เข้าสู่ระบบ
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          className="flex items-center justify-center rounded-full border border-card-border bg-card p-2.5 text-foreground md:hidden"
          aria-label={isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="mx-auto mt-4 max-w-7xl rounded-3xl border border-card-border bg-card p-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:hidden">
          <div className="flex flex-col gap-2 text-sm font-medium">
            <Link
              href="/#portals"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-2xl px-4 py-3 transition-colors ${pathname === '/' ? 'bg-foreground text-background' : 'text-foreground/75 hover:bg-background hover:text-foreground'}`}
            >
              ระบบ
            </Link>
            <Link
              href="/#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-2xl px-4 py-3 text-foreground/75 transition-colors hover:bg-background hover:text-foreground"
            >
              วิธีใช้งาน
            </Link>


            {user && isAdmin && (
              <div className="mt-2 border-t border-card-border pt-3">
                <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
                  ผู้ดูแล
                </p>
                <div className="flex flex-col gap-2">
                  {adminLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors ${pathname === href ? 'bg-foreground text-background' : 'text-foreground/75 hover:bg-background hover:text-foreground'}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </span>
                      {href === USER_APPROVAL_PATH && pendingApprovalCount > 0 && (
                        <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${pathname === href ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                          {pendingApprovalLabel}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2 border-t border-card-border pt-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 rounded-2xl bg-background px-4 py-3 text-foreground/60">
                    <User className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenChangePassword}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-card-border px-4 py-3 text-foreground/75 transition-colors hover:bg-background hover:text-foreground"
                  >
                    <KeyRound className="h-4 w-4" />
                    เปลี่ยนรหัสผ่าน
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-card-border px-4 py-3 text-foreground/75 transition-colors hover:bg-foreground hover:text-background"
                  >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsLoginModalOpen(true)
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-background font-semibold"
                >
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </nav>

    <LoginModal 
      isOpen={isLoginModalOpen} 
      onClose={() => setIsLoginModalOpen(false)} 
    />
    <ChangePasswordModal
      isOpen={isChangePasswordOpen}
      onClose={() => setIsChangePasswordOpen(false)}
      forceChange={mustChangePassword}
    />
    </>
  )
}
