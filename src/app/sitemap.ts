import type { MetadataRoute } from 'next'
import { siteOrigin } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteOrigin}/`,
      lastModified: '2026-04-06',
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteOrigin}/login`,
      lastModified: '2026-04-06',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteOrigin}/sso-docs`,
      lastModified: '2026-04-06',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
