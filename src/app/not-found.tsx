import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ไม่พบหน้าที่ต้องการ',
  description: 'ไม่พบหน้าที่คุณกำลังมองหา กรุณาตรวจสอบ URL หรือกลับไปยังหน้าหลัก',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="text-7xl font-extrabold tracking-tighter text-foreground/10">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        ไม่พบหน้าที่ต้องการ
      </h1>
      <p className="mt-2 text-foreground/60 max-w-md">
        หน้าเว็บที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือ URL ไม่ถูกต้อง
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        กลับหน้าหลัก
      </Link>
    </section>
  )
}
