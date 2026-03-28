'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAccessDenied, AdminAlert, AdminEmptyState, AdminLoadingState } from '@/components/admin/AdminState'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Link2, 
  Unlink, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Search,
  Users,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface HrUser {
  id: number
  username: string
  full_name: string | null
  email: string | null
  role: string
  is_active: boolean
  hub_user_id: string | null
}

interface HubUser {
  id: string
  username: string
  email: string
  full_name: string | null
}

export default function SSOLinkPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth()

  const [hrUsers, setHrUsers] = useState<HrUser[]>([])
  const [hubUsers, setHubUsers] = useState<HubUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [linkingUserId, setLinkingUserId] = useState<number | null>(null)
  const [selectedHubId, setSelectedHubId] = useState('')

  // Fetch Hr-Employee users
  const fetchHrUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/hr-users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setHrUsers(data.users || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch Hr-Employee users'
      setError(msg)
    }
  }, [])

  // Fetch Hub users
  const fetchHubUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/sso/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setHubUsers(data.users || [])
    } catch (err) {
      console.error('Failed to fetch hub users:', err)
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    await Promise.all([fetchHrUsers(), fetchHubUsers()])
    setLoading(false)
  }, [fetchHrUsers, fetchHubUsers])

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      void fetchAll()
    }
  }, [authLoading, fetchAll, isAdmin, user])

  // Link Hub user to Hr-Employee user
  const handleLink = async (hrUserId: number) => {
    if (!selectedHubId) {
      setMessage({ type: 'error', text: 'กรุณาเลือก Hub User' })
      return
    }

    try {
      const res = await fetch('/api/admin/hr-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrUserId, hubUserId: selectedHubId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: 'เชื่อมต่อสำเร็จ!' })
      setLinkingUserId(null)
      setSelectedHubId('')
      await fetchHrUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link'
      setMessage({ type: 'error', text: msg })
    }
  }

  // Unlink
  const handleUnlink = async (hrUserId: number) => {
    if (!confirm('ต้องการยกเลิกการเชื่อมต่อหรือไม่?')) return

    try {
      const res = await fetch('/api/admin/hr-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrUserId, hubUserId: null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: 'ยกเลิกการเชื่อมต่อสำเร็จ!' })
      await fetchHrUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unlink'
      setMessage({ type: 'error', text: msg })
    }
  }

  // Get Hub user info by ID
  const getHubUserInfo = (hubUserId: string) => {
    const hu = hubUsers.find(u => u.id === hubUserId)
    return hu ? (hu.username || hu.email) : hubUserId.substring(0, 12) + '...'
  }

  // Available (unlinked) Hub users
  const linkedHubIds = hrUsers.filter(u => u.hub_user_id).map(u => u.hub_user_id)
  const availableHubUsers = hubUsers.filter(u => !linkedHubIds.includes(u.id))

  // Filter
  const filteredUsers = hrUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const linkedCount = hrUsers.filter(u => u.hub_user_id).length
  const unlinkedCount = hrUsers.filter(u => !u.hub_user_id && u.is_active).length

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <AdminLoadingState
            title="Loading SSO user linking"
            description="Checking admin access and preparing linked account data."
          />
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <AdminAccessDenied signedIn={!!user} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <section className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Admin: SSO User Linking</h1>
                <p className="text-foreground/60">
                  เชื่อมต่อบัญชี Hub กับบัญชี Hr-Employee เพื่อให้ใช้งาน SSO ได้
                </p>
              </div>
              <button
                onClick={fetchAll}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{linkedCount}</p>
                    <p className="text-xs text-foreground/60">เชื่อมต่อแล้ว</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unlinkedCount}</p>
                    <p className="text-xs text-foreground/60">ยังไม่เชื่อมต่อ</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{hubUsers.length}</p>
                    <p className="text-xs text-foreground/60">Hub Users</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Message */}
          {message.text && (
            <div className="mb-6">
              <AdminAlert
                tone={message.type === 'success' ? 'success' : 'error'}
                title={message.type === 'success' ? 'SSO link updated' : 'Unable to update SSO link'}
                description={message.text}
                action={
                  <button
                    type="button"
                    onClick={() => setMessage({ type: '', text: '' })}
                    className="rounded-full border border-current/15 px-3 py-1.5 text-xs font-medium transition hover:bg-white/50"
                  >
                    Dismiss
                  </button>
                }
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6">
              <AdminAlert
                tone="error"
                title="Unable to connect to Hr-Employee"
                description={`${error} ตรวจสอบว่าเพิ่ม HR_SUPABASE_URL และ HR_SUPABASE_ANON_KEY ใน .env.local แล้ว`}
              />
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="text"
                placeholder="ค้นหา Hr-Employee user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-card-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-card-border rounded-3xl shadow-sm overflow-hidden"
          >
            {loading ? (
              <div className="p-6">
                <AdminLoadingState
                  title="Loading SSO user links"
                  description="Fetching Hr-Employee users and available hub accounts for account linking."
                />
              </div>
            ) : hrUsers.length === 0 ? (
              <div className="p-6">
                <AdminEmptyState
                  icon={Users}
                  title="No Hr-Employee users found"
                  description="Users will appear here once the Hr-Employee source is connected and accounts are available for linking."
                />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6">
                <AdminEmptyState
                  icon={Search}
                  title="No matching users"
                  description="Try a different search term to find the Hr-Employee account you want to link."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="text-left px-6 py-4 font-semibold text-foreground/70">Hr-Employee User</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground/70">Role</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground/70">Hub SSO Status</th>
                      <th className="text-right px-6 py-4 font-semibold text-foreground/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((hrUser) => (
                      <tr key={hrUser.id} className="border-b border-card-border/50 hover:bg-foreground/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{hrUser.username}</p>
                            <p className="text-xs text-foreground/50">{hrUser.full_name || hrUser.email || '-'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            hrUser.role === 'Admin'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-blue-500/10 text-blue-600'
                          }`}>
                            {hrUser.role === 'Admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {hrUser.hub_user_id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-lg bg-green-500/10 text-green-600">
                                ✅ Linked
                              </span>
                              <span className="text-xs text-foreground/50">
                                → {getHubUserInfo(hrUser.hub_user_id)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-red-500/10 text-red-500">
                              ❌ Not Linked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {linkingUserId === hrUser.id ? (
                            <div className="flex items-center gap-2 justify-end">
                              <select
                                value={selectedHubId}
                                onChange={(e) => setSelectedHubId(e.target.value)}
                                className="text-xs px-3 py-2 bg-background border border-card-border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                              >
                                <option value="">-- เลือก Hub User --</option>
                                {availableHubUsers.map(hu => (
                                  <option key={hu.id} value={hu.id}>
                                    {hu.username || hu.email}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleLink(hrUser.id)}
                                className="text-xs px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => { setLinkingUserId(null); setSelectedHubId(''); }}
                                className="text-xs px-3 py-2 bg-foreground/10 rounded-lg hover:bg-foreground/20 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-end">
                              {hrUser.hub_user_id ? (
                                <button
                                  onClick={() => handleUnlink(hrUser.id)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-2 text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
                                >
                                  <Unlink className="w-3.5 h-3.5" />
                                  Unlink
                                </button>
                              ) : (
                                <button
                                  onClick={() => setLinkingUserId(hrUser.id)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-2 text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors font-medium"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                  Link
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
