'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAccessDenied, AdminAlert, AdminEmptyState, AdminLoadingState } from '@/components/admin/AdminState'
import { Shield, Users, Edit2, Save, X, UserPlus, KeyRound, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { ADMIN_SYSTEMS } from '@/lib/system-access'

interface User {
  id: string
  username: string
  email: string
  full_name: string
  role: string
  status: string
  created_at: string
  system_roles: Record<string, string>
}

const ROLES = [
  { value: 'none', label: 'No Access', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'viewer', label: 'Viewer', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'editor', label: 'Editor', color: 'bg-green-50 text-green-600 border-green-200' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-50 text-purple-600 border-purple-200' },
]

export default function UserManagementPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editedRoles, setEditedRoles] = useState<Record<string, string>>({})
  const [editedUsername, setEditedUsername] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [resettingUser, setResettingUser] = useState<string | null>(null)
  const [copiedTempPassword, setCopiedTempPassword] = useState(false)
  const [resetPasswordResult, setResetPasswordResult] = useState<{
    userId: string
    username: string
    fullName: string
    temporaryPassword: string
  } | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      console.log('Fetched users:', data)
      
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users)
      } else {
        setUsers([])
        setErrorMessage(data.error || 'No users found')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setErrorMessage('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      void fetchUsers()
    }
  }, [authLoading, fetchUsers, isAdmin, user])

  const handleEdit = (user: User) => {
    setEditingUser(user.id)
    setEditedRoles({ ...user.system_roles })
    setEditedUsername(user.username)
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSave = async (userId: string) => {
    setSaving(userId)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/admin/user-roles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_roles: editedRoles, username: editedUsername.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update permissions')
      }

      setSuccessMessage('Permissions updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      await fetchUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Error saving roles:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update permissions')
    } finally {
      setSaving(null)
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setEditedRoles({})
    setEditedUsername('')
    setErrorMessage('')
  }

  const handleResetPassword = async (targetUser: User) => {
    const confirmed = window.confirm(
      `รีเซ็ตรหัสผ่านของ ${targetUser.full_name || targetUser.username} ใช่หรือไม่?\n\nระบบจะสร้างรหัสชั่วคราวใหม่ และบังคับให้ผู้ใช้เปลี่ยนรหัสหลังล็อกอินครั้งถัดไป`
    )

    if (!confirmed) {
      return
    }

    setResettingUser(targetUser.id)
    setErrorMessage('')
    setSuccessMessage('')
    setCopiedTempPassword(false)

    try {
      const response = await fetch(`/api/admin/users/${targetUser.id}/reset-password`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setResetPasswordResult({
        userId: data.user.id,
        username: data.user.username,
        fullName: data.user.full_name || data.user.username,
        temporaryPassword: data.temporaryPassword,
      })
      setSuccessMessage('Temporary password generated successfully')
    } catch (error) {
      console.error('Error resetting password:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setResettingUser(null)
    }
  }

  const handleCopyTemporaryPassword = async () => {
    if (!resetPasswordResult?.temporaryPassword) {
      return
    }

    try {
      await navigator.clipboard.writeText(resetPasswordResult.temporaryPassword)
      setCopiedTempPassword(true)
      window.setTimeout(() => setCopiedTempPassword(false), 2000)
    } catch (error) {
      console.error('Failed to copy temporary password:', error)
      setErrorMessage('Unable to copy the temporary password. Please copy it manually.')
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find(r => r.value === role) || ROLES[0]
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>{roleConfig.label}</span>
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <AdminLoadingState
            title="Loading user management"
            description="Fetching approved users and their current access levels."
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
    <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-black/[0.08] rounded-3xl p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">
                  Admin
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                User Management
              </h1>
              <p className="text-[#1d1d1f]/60 mt-1">
                Manage user access permissions for all systems
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#1d1d1f]/60 bg-black/[0.03] px-4 py-2 rounded-xl">
              <Shield className="w-4 h-4" />
              <span>{users.length} active users</span>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <AdminAlert tone="success" title="Permissions updated" description={successMessage} />
          </motion.div>
        )}

        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <AdminAlert tone="error" title="Unable to load user access" description={errorMessage} />
          </motion.div>
        )}

        {resetPasswordResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Temporary password ready</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">
                    ส่งรหัสนี้ให้ <strong>{resetPasswordResult.fullName}</strong> (@{resetPasswordResult.username}) แล้วให้เข้าสู่ระบบด้วยรหัสชั่วคราว จากนั้นระบบจะบังคับให้ตั้งรหัสผ่านใหม่ทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTemporaryPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
                >
                  {copiedTempPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedTempPassword ? 'Copied' : 'Copy password'}
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-amber-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Temporary Password</div>
                <div className="mt-2 break-all font-mono text-lg font-semibold text-foreground">
                  {resetPasswordResult.temporaryPassword}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <AdminLoadingState
            title="Loading user management"
            description="Fetching approved users and their current system roles."
          />
        ) : users.length === 0 ? (
          <AdminEmptyState
            icon={UserPlus}
            title="No approved users yet"
            description="Users will appear here after they are approved and ready for permission management."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-black/[0.08] rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1d1d1f]">Role</th>
                    {ADMIN_SYSTEMS.map(system => (
                      <th key={system.id} className="px-4 py-4 text-center text-sm font-semibold text-[#1d1d1f]">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{system.icon}</span>
                          <span className="hidden sm:inline">{system.name}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1d1d1f]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-200">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1d1d1f]">{user.full_name || user.username}</p>
                            {editingUser === user.id ? (
                              <div className="flex items-center gap-1 mt-1 mb-1">
                                <span className="text-sm text-[#1d1d1f]/50">@</span>
                                <input
                                  type="text"
                                  value={editedUsername}
                                  onChange={(e) => setEditedUsername(e.target.value)}
                                  className="px-2 py-0.5 text-sm border border-black/10 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-32"
                                  placeholder="username"
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-[#1d1d1f]/50">@{user.username}</p>
                            )}
                            <p className="text-xs text-[#1d1d1f]/40">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      {ADMIN_SYSTEMS.map(system => {
                        const currentRole = editingUser === user.id 
                          ? editedRoles[system.id] 
                          : user.system_roles[system.id] || 'none'
                        
                        return (
                          <td key={system.id} className="px-4 py-4 text-center">
                            {editingUser === user.id ? (
                              <select
                                value={currentRole}
                                onChange={(e) => setEditedRoles({ ...editedRoles, [system.id]: e.target.value })}
                                className="px-3 py-1.5 text-sm border border-black/10 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              >
                                {ROLES.map(role => (
                                  <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                              </select>
                            ) : (
                              getRoleBadge(currentRole)
                            )}
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 text-center">
                        {editingUser === user.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSave(user.id)}
                              disabled={saving === user.id}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                            >
                              {saving === user.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-black/[0.1] hover:bg-black/[0.15] text-black/60 rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResetPassword(user)}
                              disabled={resettingUser === user.id}
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                              title="Reset password"
                            >
                              {resettingUser === user.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <KeyRound className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                              title="Edit permissions"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
