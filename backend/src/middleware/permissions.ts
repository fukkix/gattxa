import { Response, NextFunction } from 'express'
import { pool } from '../config/database.js'
import { AuthRequest } from './auth.js'

export type Permission = 'view' | 'comment' | 'edit' | 'manage'

/**
 * 检查用户是否有项目权限
 */
export const checkProjectPermission = (requiredPermission: Permission) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId || req.params.id
      const userId = req.userId!

      if (!projectId) {
        return res.status(400).json({ error: '缺少项目 ID' })
      }

      // 查询用户在项目中的权限
      const result = await pool.query(
        `SELECT role, permissions FROM project_members 
         WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
        [projectId, userId]
      )

      if (result.rows.length === 0) {
        return res.status(403).json({ error: '无权限访问此项目' })
      }

      const member = result.rows[0]

      // 所有者和管理员拥有所有权限
      if (member.role === 'owner' || member.role === 'admin') {
        req.projectRole = member.role
        req.projectPermissions = member.permissions
        return next()
      }

      // 检查特定权限
      if (!member.permissions[requiredPermission]) {
        return res.status(403).json({ 
          error: `无权限执行此操作，需要 ${requiredPermission} 权限` 
        })
      }

      req.projectRole = member.role
      req.projectPermissions = member.permissions
      next()
    } catch (error) {
      console.error('权限检查失败:', error)
      res.status(500).json({ error: '权限检查失败' })
    }
  }
}

/**
 * 检查用户是否是项目成员
 */
export const checkProjectMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.params.id
    const userId = req.userId!

    if (!projectId) {
      return res.status(400).json({ error: '缺少项目 ID' })
    }

    const result = await pool.query(
      `SELECT role, permissions FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(403).json({ error: '您不是项目成员' })
    }

    const member = result.rows[0]
    req.projectRole = member.role
    req.projectPermissions = member.permissions
    next()
  } catch (error) {
    console.error('成员检查失败:', error)
    res.status(500).json({ error: '成员检查失败' })
  }
}

/**
 * 检查用户是否是项目所有者
 */
export const checkProjectOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.params.id
    const userId = req.userId!

    if (!projectId) {
      return res.status(400).json({ error: '缺少项目 ID' })
    }

    const result = await pool.query(
      `SELECT role FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND role = 'owner' AND status = 'active'`,
      [projectId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(403).json({ error: '只有项目所有者可以执行此操作' })
    }

    req.projectRole = 'owner'
    next()
  } catch (error) {
    console.error('所有者检查失败:', error)
    res.status(500).json({ error: '所有者检查失败' })
  }
}

// 扩展 AuthRequest 接口
declare module './auth.js' {
  interface AuthRequest {
    projectRole?: string
    projectPermissions?: Record<string, boolean>
  }
}
