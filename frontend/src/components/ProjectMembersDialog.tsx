import { useState, useEffect } from 'react'
import axios from 'axios'

interface Member {
  id: string
  user_id: string
  user_name: string
  user_email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: {
    view: boolean
    comment: boolean
    edit: boolean
    manage: boolean
  }
  joined_at: string
  invited_by_name?: string
}

interface Invitation {
  id: string
  email: string
  role: string
  invited_at: string
  expires_at: string
  status: string
  invited_by_name: string
}

interface ProjectMembersDialogProps {
  projectId: string
  projectName: string
  onClose: () => void
}

export default function ProjectMembersDialog({ projectId, projectName, onClose }: ProjectMembersDialogProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members')

  const currentUserId = localStorage.getItem('userId')

  useEffect(() => {
    loadMembers()
    loadInvitations()
  }, [projectId])

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMembers(response.data)
    } catch (error) {
      console.error('加载成员失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/invitations`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setInvitations(response.data.filter((inv: Invitation) => inv.status === 'pending'))
    } catch (error) {
      console.error('加载邀请失败:', error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/invitations`,
        { email: inviteEmail, role: inviteRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setInviteEmail('')
      setShowInviteForm(false)
      await loadInvitations()
      
      // 显示邀请链接
      const invitationUrl = response.data.invitation_url
      alert(`邀请已发送！\n\n邀请链接：\n${invitationUrl}\n\n请将此链接发送给 ${inviteEmail}`)
    } catch (error: any) {
      console.error('邀请失败:', error)
      alert(error.response?.data?.error || '邀请失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`确定要移除成员 ${memberName} 吗？`)) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      await loadMembers()
    } catch (error: any) {
      console.error('移除成员失败:', error)
      alert(error.response?.data?.error || '移除成员失败')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('确定要撤销这个邀请吗？')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/invitations/${invitationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      await loadInvitations()
    } catch (error: any) {
      console.error('撤销邀请失败:', error)
      alert(error.response?.data?.error || '撤销邀请失败')
    }
  }

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      owner: '所有者',
      admin: '管理员',
      member: '成员',
      viewer: '查看者'
    }
    return roleNames[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const currentMember = members.find(m => m.user_id === currentUserId)
  const canManage = currentMember?.permissions.manage || currentMember?.role === 'owner' || currentMember?.role === 'admin'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">项目成员</h2>
              <p className="text-sm text-gray-600 mt-1">{projectName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 标签页 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              成员 ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'invitations'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              邀请 ({invitations.length})
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'members' ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{member.user_name}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getRoleBadgeColor(member.role)}`}>
                          {getRoleName(member.role)}
                        </span>
                        {member.user_id === currentUserId && (
                          <span className="text-xs text-gray-500">(你)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{member.user_email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        加入于 {new Date(member.joined_at).toLocaleDateString()}
                        {member.invited_by_name && ` • 由 ${member.invited_by_name} 邀请`}
                      </div>
                    </div>
                  </div>

                  {canManage && member.role !== 'owner' && member.user_id !== currentUserId && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.user_name)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      移除
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>暂无待处理的邀请</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{invitation.email}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getRoleBadgeColor(invitation.role)}`}>
                          {getRoleName(invitation.role)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        邀请于 {new Date(invitation.invited_at).toLocaleDateString()}
                        {' • 由 '}{invitation.invited_by_name} 邀请
                        {' • 过期于 '}{new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        撤销
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 底部 */}
        {canManage && (
          <div className="px-6 py-4 border-t border-gray-200">
            {showInviteForm ? (
              <form onSubmit={handleInvite} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="admin">管理员 - 可以管理项目和成员</option>
                    <option value="member">成员 - 可以编辑和评论</option>
                    <option value="viewer">查看者 - 只能查看</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? '发送中...' : '发送邀请'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false)
                      setInviteEmail('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowInviteForm(true)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                邀请成员
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
