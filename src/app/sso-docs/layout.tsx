import type { Metadata } from 'next'
import { siteName } from '@/lib/site'

export const metadata: Metadata = {
  title: 'SSO Integration Guide',
  description:
    'Read the PFS Portal SSO integration guide for token validation, user mapping, endpoint usage, and connected system handoff.',
  alternates: {
    canonical: '/sso-docs',
  },
  openGraph: {
    title: `SSO Integration Guide | ${siteName}`,
    description:
      'Technical documentation for integrating external systems with the PFS Portal SSO flow.',
    url: '/sso-docs',
    images: [
      {
        url: '/sso-docs/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'PFS Portal SSO integration guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `SSO Integration Guide | ${siteName}`,
    description:
      'Technical documentation for integrating external systems with the PFS Portal SSO flow.',
    images: ['/sso-docs/twitter-image.png'],
  },
}

export default function SSODocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
