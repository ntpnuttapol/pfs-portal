import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SSO Docs',
  description: 'Read how SSO tokens, user linking, and connected system access work inside the PFS Portal hub.',
}

export default function SSODocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
