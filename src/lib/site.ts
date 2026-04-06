export const siteName = 'PFS Portal'
export const siteTitle = 'PFS Portal Directory'
export const siteDescription =
  'ศูนย์รวมสำหรับเข้าถึงระบบภายใน ลิงก์สาธารณะ และงานที่รองรับ SSO ของ Polyfoam Suvarnabhumi'

function normalizeUrl(value: string | undefined) {
  if (!value) return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`
}

function createSiteUrl() {
  const configuredUrl =
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.VERCEL_URL) ||
    'http://localhost:3000'

  try {
    return new URL(configuredUrl)
  } catch {
    return new URL('http://localhost:3000')
  }
}

export const siteUrl = createSiteUrl()
export const siteOrigin = siteUrl.origin

export const defaultOpenGraphImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'PFS Portal — ศูนย์รวมระบบภายในและการเข้าใช้งานผ่าน SSO',
}
