import { createOgImage, ogImageContentType, ogImageSize } from '@/lib/og'

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = 'PFS Portal SSO integration guide'

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: 'SSO Integration Guide',
    title: 'Build against the PFS Portal SSO flow',
    description:
      'Read endpoint usage, token validation, user mapping, and security guidance for connected systems.',
    accentFrom: '#0ea5e9',
    accentTo: '#1e293b',
  })
}
