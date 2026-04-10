import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createError } from '../middleware/errorHandler.js'

const router = Router()

// 临时内存存储（后续替换为数据库）
const users: any[] = []

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body

    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      throw createError('邮箱已被注册', 400)
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const user = {
      id: `user_${Date.now()}`,
      email,
      passwordHash,
      displayName,
      createdAt: new Date().toISOString()
    }
    users.push(user)

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 查找用户
    const user = users.find(u => u.email === email)
    if (!user) {
      throw createError('邮箱或密码错误', 401)
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw createError('邮箱或密码错误', 401)
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
