'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAccessDenied, AdminAlert, AdminEmptyState, AdminLoadingState } from '@/components/admin/AdminState'
import { Check, X, UserCheck, Shield, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { ADMIN_SYSTEMS } from '@/lib/system-access'

interface UserRequest {
  id: string
  email: string
  username: string
  full_name: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  rejection_reason?: string
}

const ROLES = [
  { value: 'none', label: 'No Access', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'viewer', label: 'Viewer', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'editor', label: 'Editor', color: 'bg-green-50 text-green-600 border-green-200' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-50 text-purple-600 border-purple-200' },
]

export default function UserApprovalPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [systemRoles, setSystemRoles] = useState<Record<string, string>>({})
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const fetchRequests = useCallback(async (tab: 'pending' | 'all') => {
    try {
      setLoading(true)
      setErrorMessage('')

      const response = await fetch('/api/admin/user-requests')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load approval requests')
      }

      const nextRequests = data.requests
        ? tab === 'pending'
          ? data.requests.filter((request: UserRequest) => request.status === 'pending')
          : data.requests
        : []

      setRequests(nextRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setRequests([])
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load approval requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      void fetchRequests(activeTab)
    }
  }, [activeTab, authLoading, fetchRequests, isAdmin, user])

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/user-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_roles: systemRoles })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request')
      }

      await fetchRequests(activeTab)
      setSelectedRequest(null)
      setSystemRoles({})
      setSuccessMessage('User approved and access roles were assigned successfully.')
    } catch (error) {
      console.error('Error approving:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to approve request')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessing(requestId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/user-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject request')
      }

      await fetchRequests(activeTab)
      setShowRejectModal(false)
      setRejectReason('')
      setSuccessMessage('The request was rejected successfully.')
    } catch (error) {
      console.error('Error rejecting:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reject request')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-600 border border-amber-200',
      approved: 'bg-green-50 text-green-600 border border-green-200',
      rejected: 'bg-red-50 text-red-600 border border-red-200'
    }
    const labels = {
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>{labels[status as keyof typeof labels]}</span>
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <AdminLoadingState
            title="Loading user approvals"
            description="Fetching the latest access requests and approval history."
          />
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <AdminAccessDenied signedIn={!!user} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
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
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                  Admin
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                User Approval
              </h1>
              <p className="text-[#1d1d1f]/60 mt-1">
                Manage user access requests and assign system roles
              </p>
            </div>
            <div className="flex items-center gap-2 bg-black/[0.03] rounded-xl p-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pending' 
                    ? 'bg-amber-500 text-white' 
                    : 'text-[#1d1d1f]/60 hover:bg-black/[0.05]'
                }`}
              >
                Pending ({requests.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-[#1d1d1f] text-white' 
                    : 'text-[#1d1d1f]/60 hover:bg-black/[0.05]'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </motion.div>

        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <AdminAlert tone="success" title="Approval updated" description={successMessage} />
          </motion.div>
        )}

        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <AdminAlert tone="error" title="Unable to complete the request" description={errorMessage} />
          </motion.div>
        )}

        {loading ? (
          <AdminLoadingState
            title="Loading user approvals"
            description="Checking pending and historical approval requests."
          />
        ) : requests.length === 0 ? (
          <AdminEmptyState
            icon={UserPlus}
            title={activeTab === 'pending' ? 'No pending requests' : 'No approval requests found'}
            description={activeTab === 'pending'
              ? 'New access requests will appear here when users submit a registration for review.'
              : 'Approval history will appear here once user registration requests have been submitted.'}
          />
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-black/[0.08] rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-200">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">{request.full_name || request.username}</h3>
                      <p className="text-sm text-[#1d1d1f]/50">@{request.username}</p>
                      <p className="text-sm text-[#1d1d1f]/50">{request.email}</p>
                      <p className="text-xs text-[#1d1d1f]/40 mt-1">
                        Requested: {new Date(request.requested_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(request.status)}
                    
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center space-x-2 transition-colors"
                          disabled={processing === request.id}
                        >
                          {processing === request.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowRejectModal(true)
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center space-x-2 transition-colors"
                          disabled={processing === request.id}
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {request.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm text-red-600">
                      <strong>Rejection reason:</strong> {request.rejection_reason}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-black/[0.08]">
              <h2 className="text-xl font-bold text-[#1d1d1f]">
                Approve User & Assign Roles
              </h2>
              <p className="text-[#1d1d1f]/60 mt-1">
                {selectedRequest.full_name} ({selectedRequest.email})
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <h3 className="font-medium text-blue-600 mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  System Access Permissions
                </h3>
                <p className="text-sm text-blue-600/70">
                  Select which systems this user can access and their role for each system.
                </p>
              </div>

              <div className="space-y-3">
                {ADMIN_SYSTEMS.map((system) => (
                  <div
                    key={system.id}
                    className="flex items-center justify-between p-4 bg-[#f4f4f6] rounded-2xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{system.icon}</span>
                      <span className="font-medium text-[#1d1d1f]">{system.name}</span>
                    </div>
                    <select
                      value={systemRoles[system.id] || 'viewer'}
                      onChange={(e) => setSystemRoles({ ...systemRoles, [system.id]: e.target.value })}
                      className="px-3 py-2 border border-black/10 rounded-xl bg-white text-[#1d1d1f] focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-black/[0.08] flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setSystemRoles({})
                }}
                className="px-4 py-2 text-[#1d1d1f]/60 hover:bg-black/[0.05] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center space-x-2 transition-colors"
                disabled={processing === selectedRequest.id}
              >
                {processing === selectedRequest.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Approve & Create Account</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-black/[0.08]">
              <h2 className="text-xl font-bold text-[#1d1d1f]">Reject Request</h2>
            </div>
            <div className="p-6">
              <p className="text-[#1d1d1f]/60 mb-4">
                Are you sure you want to reject {selectedRequest.full_name || selectedRequest.username}?
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
                className="w-full px-4 py-3 border border-black/10 rounded-xl bg-[#f4f4f6] text-[#1d1d1f] resize-none focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
              />
            </div>
            <div className="p-6 border-t border-black/[0.08] flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-[#1d1d1f]/60 hover:bg-black/[0.05] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center space-x-2 transition-colors"
                disabled={processing === selectedRequest.id}
              >
                {processing === selectedRequest.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>Reject</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
