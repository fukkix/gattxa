import { useState, useEffect } from 'react'
import axios from 'axios'
import NotificationCenter from './NotificationCenter'

export default function NotificationButton() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    
    // 每 30 秒刷新一次未读数量
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications?unreadOnly=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUnreadCount(response.data.length)
    } catch (error) {
      console.error('加载未读通知数量失败:', error)
    }
  }

  const handleOpen = () => {
    setShowNotifications(true)
  }

  const handleClose = () => {
    setShowNotifications(false)
    loadUnreadCount() // 关闭时刷新未读数量
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="通知"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && <NotificationCenter onClose={handleClose} />}
    </>
  )
}
