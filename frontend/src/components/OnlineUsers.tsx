import { useState, useEffect } from 'react'
import { websocketService } from '../services/websocket'

interface OnlineUser {
  userId: string
  userName: string
  userEmail: string
  joinedAt: number
}

interface OnlineUsersProps {
  projectId: string
}

export default function OnlineUsers({ projectId }: OnlineUsersProps) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // 监听在线用户列表
    websocketService.onUsersOnline((onlineUsers) => {
      setUsers(onlineUsers)
    })

    // 监听用户加入
    websocketService.onUserJoined((data) => {
      setUsers((prev) => {
        // 检查用户是否已存在
        if (prev.some((u) => u.userId === data.userId)) {
          return prev
        }
        return [...prev, data]
      })
    })

    // 监听用户离开
    websocketService.onUserLeft((data) => {
      setUsers((prev) => prev.filter((u) => u.userId !== data.userId))
    })

    return () => {
      websocketService.off('users:online')
      websocketService.off('user:joined')
      websocketService.off('user:left')
    }
  }, [projectId])

  if (users.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 折叠状态 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-3 bg-surface-container-high text-on-surface rounded-full shadow-lg hover:shadow-xl transition-all"
          title="在线用户"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            group
          </span>
          <span className="font-medium">{users.length} 人在线</span>
        </button>
      )}

      {/* 展开状态 */}
      {isExpanded && (
        <div className="bg-surface-container-high rounded-2xl shadow-xl overflow-hidden w-80">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">
                group
              </span>
              <h3 className="text-title-md font-medium text-on-surface">
                在线用户 ({users.length})
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
              title="收起"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* 用户列表 */}
          <div className="max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
              >
                {/* 头像 */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-title-sm font-medium text-primary">
                      {user.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* 在线状态指示器 */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary rounded-full border-2 border-surface-container-high"></div>
                </div>

                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-on-surface truncate">
                    {user.userName}
                  </p>
                  <p className="text-label-sm text-on-surface-variant truncate">
                    {user.userEmail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
