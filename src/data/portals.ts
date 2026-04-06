export interface PortalDefinition {
  id: string | number
  title: string
  description: string
  url: string
  category?: string
  icon?: string
  status?: 'active' | 'maintenance' | 'offline'
  requiresSso?: boolean
  ssoSystemId?: string
  ssoTargetUrl?: string
}

function normalizePortalTitle(title: string) {
  if (title === 'Hr-employee') return 'Hr-System'
  if (title === 'Project-Finishing') return 'DX Project'
  if (title === 'Fleet Booking') return 'Car Booking'
  return title
}

export const DEFAULT_PORTALS: PortalDefinition[] = [
  {
    id: 1,
    title: 'Hr-System',
    description: 'Human Resources and Employee Health management system.',
    url: 'https://pfs-system.vercel.app/login',
    category: 'system',
    icon: 'users',
    status: 'active',
    ssoSystemId: 'hr-employee',
    ssoTargetUrl: 'https://pfs-system.vercel.app/login',
  },
  {
    id: 2,
    title: 'Moldshop',
    description: 'Management system for mold maintenance and work orders.',
    url: 'https://moldshop.vercel.app/',
    category: 'system',
    icon: 'settings',
    status: 'active',
    ssoSystemId: 'moldshop',
    ssoTargetUrl: 'https://moldshop.vercel.app/login',
  },
  {
    id: 3,
    title: 'DX Project',
    description: 'Production monitoring and project finishing dashboard.',
    url: 'https://production-dashboard-pink.vercel.app/login',
    category: 'analytics',
    icon: 'line-chart',
    status: 'active',
    ssoSystemId: 'project-finishing',
    ssoTargetUrl: 'https://production-dashboard-pink.vercel.app/login',
  },
  {
    id: 4,
    title: 'Car Booking',
    description: 'Vehicle and fleet reservation management.',
    url: 'https://pfs-bookingcar.vercel.app/',
    category: 'system',
    icon: 'car',
    status: 'active',
    ssoSystemId: 'booking',
    ssoTargetUrl: 'https://pfs-bookingcar.vercel.app/',
  },
  {
    id: 5,
    title: 'Moneybill-Oil',
    description: 'Fuel tracking and financial billing system.',
    url: 'https://Polyfoampfs.com/moneytrack/login.php',
    category: 'system',
    icon: 'fuel',
    status: 'active',
    ssoSystemId: 'moneytrack',
    ssoTargetUrl: 'https://Polyfoampfs.com/moneytrack/login.php',
  },
  {
    id: 6,
    title: 'PFS Official Website',
    description: 'Visit our corporate website for more information.',
    url: 'https://www.pfs.co.th',
    category: 'external',
    icon: 'globe',
    status: 'active',
  },
]

export const SSO_CONFIG: Record<
  string,
  { ssoSystemId: string; ssoTargetUrl: string }
> = {
  'Hr-System': {
    ssoSystemId: 'hr-employee',
    ssoTargetUrl: 'https://pfs-system.vercel.app/login',
  },
  'Hr-employee': {
    ssoSystemId: 'hr-employee',
    ssoTargetUrl: 'https://pfs-system.vercel.app/login',
  },
  Moldshop: {
    ssoSystemId: 'moldshop',
    ssoTargetUrl: 'https://moldshop.vercel.app/login',
  },
  'DX Project': {
    ssoSystemId: 'project-finishing',
    ssoTargetUrl: 'https://production-dashboard-pink.vercel.app/login',
  },
  'Project-Finishing': {
    ssoSystemId: 'project-finishing',
    ssoTargetUrl: 'https://production-dashboard-pink.vercel.app/login',
  },
  'Car Booking': {
    ssoSystemId: 'booking',
    ssoTargetUrl: 'https://pfs-bookingcar.vercel.app/',
  },
  'Fleet Booking': {
    ssoSystemId: 'booking',
    ssoTargetUrl: 'https://pfs-bookingcar.vercel.app/',
  },
  'Moneybill-Oil': {
    ssoSystemId: 'moneytrack',
    ssoTargetUrl: 'https://Polyfoampfs.com/moneytrack/login.php',
  },
}

export function mergePortalData(portals: PortalDefinition[]) {
  const merged = portals.map((portal) => ({
    ...portal,
    title: normalizePortalTitle(portal.title),
    ...(SSO_CONFIG[normalizePortalTitle(portal.title)] || SSO_CONFIG[portal.title] || {}),
  }))

  const existingTitles = new Set(merged.map((portal) => portal.title))
  const missingDefaults = DEFAULT_PORTALS.filter(
    (portal) => !existingTitles.has(portal.title)
  )

  return [...merged, ...missingDefaults].sort((left, right) =>
    left.title.localeCompare(right.title)
  )
}
