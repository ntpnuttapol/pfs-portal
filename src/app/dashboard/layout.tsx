import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your personalized access summary, quick actions, and launch directory inside the PFS Portal hub.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
