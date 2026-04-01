import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Admin Workspace',
    template: '%s | Admin | PFS Portal',
  },
  description: 'Manage approvals, permissions, and connected SSO workflows inside the PFS Portal admin workspace.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
