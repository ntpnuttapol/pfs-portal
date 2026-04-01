export const siteName = 'PFS Portal'
export const siteTitle = 'PFS Portal Directory'
export const siteDescription =
  'A centralized hub for internal systems, public resources, and SSO-enabled workflows across Polyfoam Suvarnabhumi.'

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
  url: '/pfslogo.png',
  width: 512,
  height: 512,
  alt: 'PFS Portal logo',
}
