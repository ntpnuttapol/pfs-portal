export const ADMIN_SYSTEMS = [
  { id: 'moldshop', name: 'Moldshop', icon: '🏭' },
  { id: 'hr-employee', name: 'HR Employee', icon: '🏥' },
  { id: 'polyfoam', name: 'Polyfoam', icon: '🏢' },
  { id: 'booking', name: 'Booking Car', icon: '🚗' },
  { id: 'moneytrack', name: 'Money Track', icon: '💰' },
  { id: 'project-finishing', name: 'Project Finishing', icon: '📊' },
] as const

export const DEFAULT_SYSTEM_IDS = ADMIN_SYSTEMS.map((system) => system.id)
