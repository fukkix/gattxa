import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      
      // 检查是否有待处理的邀请
      const pendingInvitation = localStorage.getItem('pendingInvitation')
      if (pendingInvitation) {
        localStorage.removeItem('pendingInvitation')
        navigate(`/invitation/${pendingInvitation}`)
      } else {
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '登录失败，请重试')
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

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-8">
          <h2 className="text-headline-sm font-headline text-on-surface mb-6">
            登录账户
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-xl">
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold 
                       hover:opacity-90 active:scale-95 transition-all disabled:opacity-50
                       shadow-ambient"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              还没有账户？{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* Guest Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            以访客模式继续 →
          </button>
        </div>
      </div>
    </div>
  )
}
