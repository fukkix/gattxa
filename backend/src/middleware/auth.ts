import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler.js'

export interface AuthRequest extends Request {
  userId?: string
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw createError('未提供认证令牌', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    req.userId = decoded.userId
    
    next()
  } catch (error) {
    next(createError('认证失败', 401))
  }
}
