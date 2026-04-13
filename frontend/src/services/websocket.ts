import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  private projectId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: NodeJS.Timeout | null = null

  // 连接到 WebSocket 服务器
  connect(token: string) {
    if (this.socket?.connected) {
      console.log('WebSocket 已连接')
      return
    }

    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    })

    this.setupEventListeners()
  }

  // 设置事件监听器
  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket 已连接')
      this.reconnectAttempts = 0

      // 如果之前加入了项目，重新加入
      if (this.projectId) {
        this.joinProject(this.projectId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket 断开连接:', reason)
      this.stopHeartbeat()
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('WebSocket 重连失败，已达到最大重试次数')
      }
    })

    this.socket.on('error', (error: { message: string }) => {
      console.error('WebSocket 错误:', error.message)
    })
  }

  // 加入项目房间
  joinProject(projectId: string) {
    if (!this.socket?.connected) {
      console.warn('WebSocket 未连接，无法加入项目')
      return
    }

    this.projectId = projectId
    this.socket.emit('join:project', projectId)
    this.startHeartbeat(projectId)

    console.log(`加入项目房间: ${projectId}`)
  }

  // 离开项目房间
  leaveProject() {
    if (!this.socket?.connected || !this.projectId) return

    this.socket.emit('leave:project', this.projectId)
    this.stopHeartbeat()
    this.projectId = null

    console.log('离开项目房间')
  }

  // 开始心跳
  private startHeartbeat(projectId: string) {
    this.stopHeartbeat()

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', projectId)
      }
    }, 30000) // 每 30 秒发送一次心跳
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // 监听用户加入
  onUserJoined(callback: (data: { userId: string; userName: string; userEmail: string; joinedAt: number }) => void) {
    this.socket?.on('user:joined', callback)
  }

  // 监听用户离开
  onUserLeft(callback: (data: { userId: string; userName: string; leftAt: number }) => void) {
    this.socket?.on('user:left', callback)
  }

  // 监听在线用户列表
  onUsersOnline(callback: (users: Array<{ userId: string; userName: string; userEmail: string; joinedAt: number }>) => void) {
    this.socket?.on('users:online', callback)
  }

  // 发送任务创建事件
  emitTaskCreate(projectId: string, task: any) {
    this.socket?.emit('task:create', { projectId, task })
  }

  // 监听任务创建
  onTaskCreated(callback: (data: { task: any; userId: string; userName: string; timestamp: number }) => void) {
    this.socket?.on('task:created', callback)
  }

  // 发送任务更新事件
  emitTaskUpdate(projectId: string, task: any) {
    this.socket?.emit('task:update', { projectId, task })
  }

  // 监听任务更新
  onTaskUpdated(callback: (data: { task: any; userId: string; userName: string; timestamp: number }) => void) {
    this.socket?.on('task:updated', callback)
  }

  // 发送任务删除事件
  emitTaskDelete(projectId: string, taskId: string) {
    this.socket?.emit('task:delete', { projectId, taskId })
  }

  // 监听任务删除
  onTaskDeleted(callback: (data: { taskId: string; userId: string; userName: string; timestamp: number }) => void) {
    this.socket?.on('task:deleted', callback)
  }

  // 发送评论创建事件
  emitCommentCreate(projectId: string, comment: any) {
    this.socket?.emit('comment:create', { projectId, comment })
  }

  // 监听评论创建
  onCommentCreated(callback: (data: { comment: any; userId: string; userName: string; timestamp: number }) => void) {
    this.socket?.on('comment:created', callback)
  }

  // 发送评论更新事件
  emitCommentUpdate(projectId: string, comment: any) {
    this.socket?.emit('comment:update', { projectId, comment })
  }

  // 监听评论更新
  onCommentUpdated(callback: (data: { comment: any; userId: string; userName: string; timestamp: number }) => void) {
    this.socket?.on('comment:updated', callback)
  }

  // 发送评论删除事件
  emitCommentDelete(projectId: string, commentId: string) {
    this.socket?.emit('comment:delete', { projectId, commentId })
  }

  // 监听评论删除
  onCommentDeleted(callback: (data: { commentId: string; userId: string; userName: string; timestamp: number }) => void) {
    this.socket?.on('comment:deleted', callback)
  }

  // 移除所有监听器
  removeAllListeners() {
    this.socket?.removeAllListeners()
  }

  // 移除特定事件监听器
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback)
  }

  // 断开连接
  disconnect() {
    this.leaveProject()
    this.socket?.disconnect()
    this.socket = null
    console.log('WebSocket 已断开')
  }

  // 获取连接状态
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // 获取当前项目 ID
  getCurrentProjectId(): string | null {
    return this.projectId
  }
}

// 导出单例
export const websocketService = new WebSocketService()
