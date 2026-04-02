'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'
import PortalGrid from '@/components/PortalGrid'
import { useAuth } from '@/contexts/AuthContext'

export default function HomeShell() {
  const { user, role, setIsLoginModalOpen } = useAuth()
  const [language, setLanguage] = useState<'en' | 'th'>('en')

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    ''
  const roleLabelMap: Record<string, string> = {
    admin: 'ผู้ดูแล',
    editor: 'ผู้แก้ไข',
    viewer: 'ผู้ใช้งาน',
    member: 'สมาชิก',
  }
  const roleLabel = role ? roleLabelMap[role] || role : 'สมาชิก'
  const howToCopy = language === 'th'
    ? {
        eyebrow: 'วิธีใช้งาน Hub',
        title: 'ใช้งานง่ายใน 3 ขั้นตอน',
        body:
          'Hub Web ใช้สำหรับรวมระบบสำคัญของบริษัทไว้ในหน้าเดียว ช่วยให้ค้นหา ขอสิทธิ์ และเข้าใช้งานระบบที่เชื่อมต่อได้ง่ายขึ้น',
        steps: [
          'เลือกดูรายการระบบ แล้วกดระบบที่ต้องการใช้งาน',
          'หากยังไม่มีสิทธิ์ ให้กดเข้าสู่ระบบหรือส่งคำขอใช้งาน',
          'เปิดใช้งานระบบต่อได้ทันที หรือเชื่อมต่อผ่าน SSO ถ้าระบบนั้นรองรับ',
        ],
        note: 'หากต้องการเชื่อมต่อระบบเพิ่มเติม สามารถเปิดดูเอกสาร SSO ได้จากปุ่มด้านล่าง',
        docs: 'อ่านคู่มือ SSO',
        login: 'เข้าสู่ระบบ / ขอสิทธิ์',
      }
    : {
        eyebrow: 'How To Use The Hub',
        title: 'Simple access in 3 steps',
        body:
          'The Hub brings key company systems into one place so users can browse tools, request access, and continue into connected apps more easily.',
        steps: [
          'Browse the system list and choose the tool you need.',
          'Sign in or request access if your account is not ready yet.',
          'Open the system directly or continue with SSO when supported.',
        ],
        note: 'If you need technical integration details, you can open the SSO guide below.',
        docs: 'Read SSO Docs',
        login: 'Sign In / Request Access',
      }

  return (
    <div className="flex flex-col w-full">
      {user ? (
        <section className="pt-24 pb-2 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
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
            </motion.div>
          </div>
        </section>
      ) : null}

      {!user && (
        <section className="px-6 pt-24">
          <div className="mx-auto flex max-w-7xl justify-end">
            <div className="inline-flex rounded-full border border-card-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${language === 'en' ? 'bg-foreground text-background' : 'text-foreground/60 hover:text-foreground'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('th')}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${language === 'th' ? 'bg-foreground text-background' : 'text-foreground/60 hover:text-foreground'}`}
              >
                ไทย
              </button>
            </div>
          </div>
        </section>
      )}

      <PortalGrid sectionClassName={`${user ? 'pt-6' : 'pt-8'} pb-16 px-6 bg-background`} language={language} />

      {!user && (
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[32px] border border-card-border bg-card p-8 shadow-sm lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                {howToCopy.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {howToCopy.title}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/60 md:text-base">
                {howToCopy.body}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {howToCopy.steps.map((step, index) => (
                  <div key={step} className="rounded-3xl border border-card-border bg-background p-5">
                    <div className="text-sm font-semibold text-foreground/40">
                      {language === 'th' ? `ขั้นตอน ${index + 1}` : `Step ${index + 1}`}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm leading-relaxed text-foreground/55">
                {howToCopy.note}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/sso-docs"
                  className="inline-flex items-center gap-2 rounded-full border border-card-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                >
                  {howToCopy.docs}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  {howToCopy.login}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
