import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import { initializeWebSocket } from './services/websocket.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import uploadRoutes from './routes/upload.js'
import parseRoutes from './routes/parse.js'
import healthRoutes from './routes/health.js'
import shareRoutes from './routes/share.js'
import commentRoutes from './routes/comments.js'
import userRoutes from './routes/users.js'
import memberRoutes from './routes/members.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '50mb' })) // 增加 JSON 限制以支持大文件内容
app.use(requestLogger)

// Routes
app.use('/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/parse', parseRoutes)
app.use('/api', shareRoutes)
app.use('/api', commentRoutes)
app.use('/api', userRoutes)
app.use('/api', memberRoutes)

// Error handling
app.use(errorHandler)

// Initialize WebSocket
const io = initializeWebSocket(httpServer)
console.log('✅ WebSocket 服务已初始化')

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV}`)
  console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`)
  console.log(`🔌 WebSocket ready`)
})
