import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    // 验证密码长度
    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }

    setLoading(true)

    try {
      await register(email, password, displayName)
      
      // 检查是否有待处理的邀请
      const pendingInvitation = localStorage.getItem('pendingInvitation')
      if (pendingInvitation) {
        localStorage.removeItem('pendingInvitation')
        navigate(`/invitation/${pendingInvitation}`)
      } else {
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary font-headline tracking-tight mb-2">
            GanttXa
          </h1>
          <p className="text-on-surface-variant text-body-md">
            在线甘特图协作工具
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-8">
          <h2 className="text-headline-sm font-headline text-on-surface mb-6">
            创建账户
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-xl">
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-label-md text-on-surface-variant mb-2">
                显示名称
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="你的名字"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-label-md text-on-surface-variant mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-label-md text-on-surface-variant mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="至少 6 位"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-label-md text-on-surface-variant mb-2">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="再次输入密码"
              />
              <p className="mt-2 text-xs text-on-surface-variant">
                请再次输入密码以确认
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold 
                       hover:opacity-90 active:scale-95 transition-all disabled:opacity-50
                       shadow-ambient"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              已有账户？{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-on-surface-variant">
            注册即表示你同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  )
}
