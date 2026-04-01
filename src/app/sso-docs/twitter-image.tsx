import { createOgImage, ogImageContentType, ogImageSize } from '@/lib/og'

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = 'PFS Portal SSO integration guide'

export default function TwitterImage() {
  return createOgImage({
    eyebrow: 'SSO Docs',
    title: 'Build against the PFS Portal SSO flow',
    description:
      'Read endpoint usage, token validation, user mapping, and security guidance for connected systems.',
    accentFrom: '#0284c7',
    accentTo: '#0f172a',
  })
}
