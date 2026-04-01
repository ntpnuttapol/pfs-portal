import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Approval',
  description: 'Review pending registration requests, approve new users, and assign system access roles.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserApprovalLayout({ children }: { children: React.ReactNode }) {
  return children
}
