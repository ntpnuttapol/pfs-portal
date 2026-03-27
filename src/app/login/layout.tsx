import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to the PFS Portal hub or request access to internal systems and SSO-enabled tools.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
