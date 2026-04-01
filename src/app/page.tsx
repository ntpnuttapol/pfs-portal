import type { Metadata } from 'next'
import HomeShell from '@/components/HomeShell'
import {
  siteDescription,
  siteName,
  siteOrigin,
} from '@/lib/site'

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Polyfoam Suvarnabhumi',
      url: siteOrigin,
      logo: `${siteOrigin}/opengraph-image.png`,
    },
    {
      '@type': 'WebSite',
      name: siteName,
      url: siteOrigin,
      description: siteDescription,
    },
    {
      '@type': 'CollectionPage',
      name: 'PFS Portal Directory',
      url: siteOrigin,
      description: siteDescription,
      isPartOf: {
        '@type': 'WebSite',
        name: siteName,
        url: siteOrigin,
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PFS Portal used for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PFS Portal is a centralized directory for internal systems, public resources, and SSO-enabled launch flows used across Polyfoam Suvarnabhumi.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can users request access from the portal?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. New users can submit an access request for approval before they get access to protected systems and workflows.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where can developers read about the SSO flow?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Developers can review the public SSO documentation page for token validation, user mapping, and integration steps.',
          },
        },
      ],
    },
  ],
}

export const metadata: Metadata = {
  title: 'Internal Portal Directory & SSO Hub',
  description:
    'Browse Polyfoam Suvarnabhumi systems, request access, and launch SSO-enabled tools from the PFS Portal directory.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `Internal Portal Directory & SSO Hub | ${siteName}`,
    description:
      'Browse Polyfoam Suvarnabhumi systems, request access, and launch SSO-enabled tools from one portal.',
    url: '/',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'PFS Portal internal directory and SSO hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Internal Portal Directory & SSO Hub | ${siteName}`,
    description:
      'Browse Polyfoam Suvarnabhumi systems, request access, and launch SSO-enabled tools from one portal.',
    images: ['/twitter-image.png'],
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData),
        }}
      />
      <HomeShell />
    </>
  )
}
