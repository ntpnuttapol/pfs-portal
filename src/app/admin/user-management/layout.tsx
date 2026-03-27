import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Manage user permissions and system access roles across connected tools in the PFS Portal.',
}

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
  return children
}
