import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PFS Portal',
    short_name: 'PFS Portal',
    description:
      'A centralized hub for internal systems, public resources, and SSO-enabled workflows across Polyfoam Suvarnabhumi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      {
        src: '/pfslogo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pfslogo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
