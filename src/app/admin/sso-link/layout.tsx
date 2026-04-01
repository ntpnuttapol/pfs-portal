import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SSO User Linking',
  description: 'Link hub accounts to downstream HR users so SSO-enabled systems can hand off access correctly.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SSOLinkLayout({ children }: { children: React.ReactNode }) {
  return children
}
