import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PFS Portal',
    short_name: 'PFS Portal',
    description:
      'ศูนย์รวมสำหรับเข้าถึงระบบภายใน ลิงก์สาธารณะ และงานที่รองรับ SSO ของ Polyfoam Suvarnabhumi',
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
