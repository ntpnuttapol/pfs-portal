import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
  description: 'เข้าสู่ระบบหรือขอสิทธิ์เพื่อใช้งานระบบภายในและเครื่องมือที่รองรับ SSO',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
