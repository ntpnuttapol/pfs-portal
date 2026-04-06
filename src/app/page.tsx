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
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      name: siteName,
      url: siteOrigin,
      description: siteDescription,
      inLanguage: 'th-TH',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteOrigin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'หน้าหลัก',
          item: siteOrigin,
        },
      ],
    },
    {
      '@type': 'CollectionPage',
      name: 'ศูนย์รวมระบบภายใน',
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
          name: 'หน้านี้ใช้ทำอะไร?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'หน้านี้เป็นศูนย์รวมสำหรับค้นหาและเปิดใช้งานระบบภายใน ลิงก์สาธารณะ และระบบที่รองรับการเข้าใช้งานผ่าน SSO',
          },
        },
        {
          '@type': 'Question',
          name: 'ผู้ใช้สามารถขอสิทธิ์ผ่านหน้านี้ได้หรือไม่?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ได้ ผู้ใช้ใหม่สามารถส่งคำขอเพื่อรออนุมัติก่อนเข้าใช้งานระบบที่มีการจำกัดสิทธิ์',
          },
        },
        {
          '@type': 'Question',
          name: 'นักพัฒนาสามารถอ่านเอกสาร SSO ได้ที่ไหน?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'นักพัฒนาสามารถเปิดดูหน้าเอกสาร SSO เพื่ออ่านวิธีตรวจสอบ token การ map ผู้ใช้ และขั้นตอนเชื่อมต่อระบบ',
          },
        },
      ],
    },
  ],
}

export const metadata: Metadata = {
  title: 'ศูนย์รวมระบบภายใน',
  description:
    'รวมระบบของ Polyfoam Suvarnabhumi ไว้ในที่เดียว พร้อมการขอสิทธิ์และการเข้าใช้งานผ่าน SSO',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `ศูนย์รวมระบบภายใน | ${siteName}`,
    description:
      'รวมระบบของ Polyfoam Suvarnabhumi ไว้ในที่เดียว พร้อมการขอสิทธิ์และการเข้าใช้งานผ่าน SSO',
    url: '/',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ศูนย์รวมระบบภายในและการเข้าใช้งานผ่าน SSO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `ศูนย์รวมระบบภายใน | ${siteName}`,
    description:
      'รวมระบบของ Polyfoam Suvarnabhumi ไว้ในที่เดียว พร้อมการขอสิทธิ์และการเข้าใช้งานผ่าน SSO',
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
