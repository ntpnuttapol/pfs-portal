import { createOgImage, ogImageContentType, ogImageSize } from '@/lib/og'

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = 'PFS Portal internal directory and SSO hub'

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: 'Portal Directory',
    title: 'Internal systems. One portal.',
    description:
      'Browse business tools, request access, and launch SSO-enabled systems through the PFS Portal directory.',
    accentFrom: '#2563eb',
    accentTo: '#0f172a',
  })
}
