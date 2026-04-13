import { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Notification {
  comment_id: string
  content: string
  created_at: string
  task_id: string
  task_name: string
  project_id: string
  project_name: string
  user_id: string
  user_name: string
  user_email: string
  is_read: boolean
}

interface NotificationCenterProps {
  onClose: () => void
  onNavigateToTask?: (projectId: string, taskId: string) => void
}

export default function NotificationCenter({ onClose, onNavigateToTask }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = filter === 'unread'
        ? `${import.meta.env.VITE_API_URL}/api/notifications?unreadOnly=true`
        : `${import.meta.env.VITE_API_URL}/api/notifications`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setNotifications(response.data)
    } catch (error) {
      console.error('加载通知失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (commentId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/${commentId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // 更新本地状态
      setNotifications(prev =>
        prev.map(n => n.comment_id === commentId ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // 更新本地状态
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('标记全部已读失败:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.comment_id)
    if (onNavigateToTask) {
      onNavigateToTask(notification.project_id, notification.task_id)
    }
  }

  const highlightMentions = (text: string): string => {
    return text.replace(/@(\w+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">通知中心</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  {unreadCount}
                </span>
              )}
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

          {/* 过滤器 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              未读 {unreadCount > 0 && `(${unreadCount})`}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                全部标记为已读
              </button>
            )}
          </div>
        </div>

        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>{filter === 'unread' ? '没有未读通知' : '还没有通知'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.comment_id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.is_read
                      ? 'bg-white border-gray-200'
                      : 'bg-indigo-50 border-indigo-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 用户头像 */}
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {notification.user_name.charAt(0)}
                    </div>

                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{notification.user_name}</span>
                        <span className="text-gray-500">在</span>
                        <span className="font-medium text-gray-900 truncate">{notification.task_name}</span>
                        <span className="text-gray-500">中提到了你</span>
                      </div>

                      <div
                        className="text-sm text-gray-700 mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightMentions(notification.content) }}
                      />

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{notification.project_name}</span>
                        <span>•</span>
                        <span>{dayjs(notification.created_at).fromNow()}</span>
                        {!notification.is_read && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">未读</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 箭头图标 */}
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
