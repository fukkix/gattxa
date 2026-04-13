import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'

interface AuthenticatedSocket extends Socket {
  userId?: string
  userName?: string
  userEmail?: string
}

interface OnlineUser {
  userId: string
  userName: string
  userEmail: string
  socketId: string
  joinedAt: number
  lastActivity: number
}

// 在线用户管理（按项目分组）
const onlineUsers = new Map<string, Map<string, OnlineUser>>()

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // 认证中间件
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('认证失败：未提供 token'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      
      // 获取用户信息
      const result = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [decoded.userId]
      )

      if (result.rows.length === 0) {
        return next(new Error('认证失败：用户不存在'))
      }

      const user = result.rows[0]
      socket.userId = user.id
      socket.userName = user.name
      socket.userEmail = user.email

      next()
    } catch (error) {
      console.error('WebSocket 认证失败:', error)
      next(new Error('认证失败'))
    }
  })

  // 连接处理
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`用户连接: ${socket.userName} (${socket.userId})`)

    // 加入项目房间
    socket.on('join:project', async (projectId: string) => {
      try {
        // 验证用户是否有权限访问项目
        const result = await pool.query(
          `SELECT pm.role, pm.permissions 
           FROM project_members pm
           WHERE pm.project_id = $1 AND pm.user_id = $2 AND pm.status = 'active'`,
          [projectId, socket.userId]
        )

        if (result.rows.length === 0) {
          socket.emit('error', { message: '无权限访问此项目' })
          return
        }

        // 加入房间
        socket.join(`project:${projectId}`)

        // 添加到在线用户列表
        if (!onlineUsers.has(projectId)) {
          onlineUsers.set(projectId, new Map())
        }

        const projectUsers = onlineUsers.get(projectId)!
        projectUsers.set(socket.userId!, {
          userId: socket.userId!,
          userName: socket.userName!,
          userEmail: socket.userEmail!,
          socketId: socket.id,
          joinedAt: Date.now(),
          lastActivity: Date.now()
        })

        // 通知其他用户
        socket.to(`project:${projectId}`).emit('user:joined', {
          userId: socket.userId,
          userName: socket.userName,
          userEmail: socket.userEmail,
          joinedAt: Date.now()
        })

        // 发送当前在线用户列表
        socket.emit('users:online', Array.from(projectUsers.values()))

        console.log(`用户 ${socket.userName} 加入项目 ${projectId}`)
      } catch (error) {
        console.error('加入项目失败:', error)
        socket.emit('error', { message: '加入项目失败' })
      }
    })

    // 离开项目房间
    socket.on('leave:project', (projectId: string) => {
      handleUserLeave(socket, projectId)
    })

    // 心跳
    socket.on('heartbeat', (projectId: string) => {
      const projectUsers = onlineUsers.get(projectId)
      if (projectUsers && socket.userId) {
        const user = projectUsers.get(socket.userId)
        if (user) {
          user.lastActivity = Date.now()
        }
      }
    })

    // 任务操作事件
    socket.on('task:create', async (data: { projectId: string; task: any }) => {
      try {
        // 广播给房间内其他用户
        socket.to(`project:${data.projectId}`).emit('task:created', {
          task: data.task,
          userId: socket.userId,
          userName: socket.userName,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('任务创建广播失败:', error)
      }
    })

    socket.on('task:update', async (data: { projectId: string; task: any }) => {
      try {
        socket.to(`project:${data.projectId}`).emit('task:updated', {
          task: data.task,
          userId: socket.userId,
          userName: socket.userName,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('任务更新广播失败:', error)
      }
    })

    socket.on('task:delete', async (data: { projectId: string; taskId: string }) => {
      try {
        socket.to(`project:${data.projectId}`).emit('task:deleted', {
          taskId: data.taskId,
          userId: socket.userId,
          userName: socket.userName,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('任务删除广播失败:', error)
      }
    })

    // 评论操作事件
    socket.on('comment:create', async (data: { projectId: string; comment: any }) => {
      try {
        socket.to(`project:${data.projectId}`).emit('comment:created', {
          comment: data.comment,
          userId: socket.userId,
          userName: socket.userName,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('评论创建广播失败:', error)
      }
    })

    socket.on('comment:update', async (data: { projectId: string; comment: any }) => {
      try {
        socket.to(`project:${data.projectId}`).emit('comment:updated', {
          comment: data.comment,
          userId: socket.userId,
          userName: socket.userName,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('评论更新广播失败:', error)
      }
    })

    socket.on('comment:delete', async (data: { projectId: string; commentId: string }) => {
      try {
        socket.to(`project:${data.projectId}`).emit('comment:deleted', {
          commentId: data.commentId,
          userId: socket.userId,
          userName: socket.userName,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('评论删除广播失败:', error)
      }
    })

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`用户断开连接: ${socket.userName} (${socket.userId})`)
      
      // 从所有项目中移除用户
      onlineUsers.forEach((projectUsers, projectId) => {
        if (socket.userId && projectUsers.has(socket.userId)) {
          handleUserLeave(socket, projectId)
        }
      })
    })
  })

  // 定期清理不活跃用户（5分钟无活动）
  setInterval(() => {
    const now = Date.now()
    const timeout = 5 * 60 * 1000 // 5分钟

    onlineUsers.forEach((projectUsers, projectId) => {
      projectUsers.forEach((user, userId) => {
        if (now - user.lastActivity > timeout) {
          projectUsers.delete(userId)
          
          // 通知其他用户
          io.to(`project:${projectId}`).emit('user:left', {
            userId: user.userId,
            userName: user.userName,
            leftAt: now
          })
        }
      })

      // 如果项目没有在线用户，删除项目记录
      if (projectUsers.size === 0) {
        onlineUsers.delete(projectId)
      }
    })
  }, 60000) // 每分钟检查一次

  return io
}

function handleUserLeave(socket: AuthenticatedSocket, projectId: string) {
  socket.leave(`project:${projectId}`)

  const projectUsers = onlineUsers.get(projectId)
  if (projectUsers && socket.userId) {
    projectUsers.delete(socket.userId)

    // 通知其他用户
    socket.to(`project:${projectId}`).emit('user:left', {
      userId: socket.userId,
      userName: socket.userName,
      leftAt: Date.now()
    })

    console.log(`用户 ${socket.userName} 离开项目 ${projectId}`)
  }
}

// 获取项目在线用户数
export function getOnlineUserCount(projectId: string): number {
  return onlineUsers.get(projectId)?.size || 0
}

// 获取项目在线用户列表
export function getOnlineUsers(projectId: string): OnlineUser[] {
  const projectUsers = onlineUsers.get(projectId)
  return projectUsers ? Array.from(projectUsers.values()) : []
}
