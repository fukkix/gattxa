import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { isAuthenticated } from '../api/auth'

interface InvitationInfo {
  id: string
  project_id: string
  project_name: string
  email: string
  role: string
  invited_by_name: string
  invited_at: string
  expires_at: string
  status: string
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invitations/${token}`
      )

      setInvitation(response.data)
    } catch (err: any) {
      console.error('加载邀请失败:', err)
      setError(err.response?.data?.error || '加载邀请失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!isAuthenticated()) {
      // 保存邀请 token，登录后自动接受
      localStorage.setItem('pendingInvitation', token!)
      navigate('/login')
      return
    }

    setAccepting(true)
    try {
      const authToken = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/invitations/${token}/accept`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      // 接受成功，跳转到项目
      navigate(`/editor/${invitation?.project_id}`)
    } catch (err: any) {
      console.error('接受邀请失败:', err)
      alert(err.response?.data?.error || '接受邀请失败')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    if (confirm('确定要拒绝这个邀请吗？')) {
      navigate('/')
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

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      admin: '可以管理项目和成员，编辑项目内容，添加评论',
      member: '可以编辑项目内容，添加评论',
      viewer: '只能查看项目内容'
    }
    return descriptions[role] || ''
  }

  const isExpired = invitation && invitation.expires_at && new Date(invitation.expires_at) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GanttXa</h1>
          <p className="text-gray-600">在线甘特图协作工具</p>
        </div>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载邀请信息...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">邀请无效</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                返回首页
              </button>
            </div>
          ) : invitation ? (
            <>
              {/* 头部 */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h2 className="text-3xl font-bold">项目邀请</h2>
                    <p className="text-indigo-100">您收到了一个项目邀请</p>
                  </div>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-8">
                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">此邀请已过期</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      请联系项目管理员重新发送邀请
                    </p>
                  </div>
                ) : invitation.status !== 'pending' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">
                        此邀请已{invitation.status === 'accepted' ? '被接受' : '失效'}
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* 邀请详情 */}
                <div className="space-y-6">
                  {/* 项目信息 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目名称
                    </label>
                    <div className="text-2xl font-bold text-gray-900">
                      {invitation.project_name}
                    </div>
                  </div>

                  {/* 邀请人 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邀请人
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                        {invitation.invited_by_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{invitation.invited_by_name}</div>
                        <div className="text-sm text-gray-500">
                          邀请于 {new Date(invitation.invited_at).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 角色 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      您的角色
                    </label>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-indigo-900">
                          {getRoleName(invitation.role)}
                        </span>
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {getRoleDescription(invitation.role)}
                      </p>
                    </div>
                  </div>

                  {/* 邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邀请邮箱
                    </label>
                    <div className="text-gray-900">{invitation.email}</div>
                  </div>

                  {/* 过期时间 */}
                  {invitation.expires_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        邀请有效期
                      </label>
                      <div className="text-gray-900">
                        {new Date(invitation.expires_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                {!isExpired && invitation.status === 'pending' && (
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={handleAccept}
                      disabled={accepting}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {accepting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>接受中...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>接受邀请</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDecline}
                      disabled={accepting}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
                    >
                      拒绝
                    </button>
                  </div>
                )}

                {/* 提示信息 */}
                {!isAuthenticated() && !isExpired && invitation.status === 'pending' && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 text-blue-800">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium mb-1">需要登录</p>
                        <p>点击"接受邀请"后，您需要登录或注册账号才能加入项目。</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* 底部链接 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
