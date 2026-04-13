import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import {
  batchCreateOrUpdateTasks,
  getTasksByProjectId,
  updateTask,
  deleteTask,
  batchDeleteTasks,
} from '../models/Task.js'
import { query } from '../config/database.js'

const router = Router()

// 获取用户的所有项目
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, description, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.userId]
    )

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// 创建项目
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body

    if (!name || !name.trim()) {
      throw createError('项目名称不能为空', 400)
    }

    const result = await query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, name, description || null]
    )

    const project = result.rows[0]

    res.status(201).json({
      success: true,
      data: {
        id: project.id,
        userId: project.user_id,
        name: project.name,
        description: project.description,
        tasks: [],
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 获取单个项目（包含任务）
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const projectResult = await query('SELECT * FROM projects WHERE id = $1', [req.params.id])

    if (projectResult.rows.length === 0) {
      throw createError('项目不存在', 404)
    }

    const project = projectResult.rows[0]

    if (project.user_id !== req.userId) {
      throw createError('无权访问此项目', 403)
    }

    const tasks = await getTasksByProjectId(project.id)

    res.json({
      success: true,
      data: {
        id: project.id,
        userId: project.user_id,
        name: project.name,
        description: project.description,
        tasks,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 更新项目
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body

    const projectResult = await query('SELECT user_id FROM projects WHERE id = $1', [
      req.params.id,
    ])

    if (projectResult.rows.length === 0) {
      throw createError('项目不存在', 404)
    }

    if (projectResult.rows[0].user_id !== req.userId) {
      throw createError('无权修改此项目', 403)
    }

    const result = await query(
      'UPDATE projects SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    )

    const project = result.rows[0]

    res.json({
      success: true,
      data: {
        id: project.id,
        userId: project.user_id,
        name: project.name,
        description: project.description,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 删除项目
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const projectResult = await query('SELECT user_id FROM projects WHERE id = $1', [
      req.params.id,
    ])

    if (projectResult.rows.length === 0) {
      throw createError('项目不存在', 404)
    }

    if (projectResult.rows[0].user_id !== req.userId) {
      throw createError('无权删除此项目', 403)
    }

    await query('DELETE FROM projects WHERE id = $1', [req.params.id])

    res.json({
      success: true,
      message: '项目已删除',
    })
  } catch (error) {
    next(error)
  }
})

// 批量创建/更新任务
router.post('/:id/tasks', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { tasks } = req.body

    if (!Array.isArray(tasks)) {
      throw createError('tasks 必须是数组', 400)
    }

    // 验证项目权限
    const projectResult = await query('SELECT user_id FROM projects WHERE id = $1', [
      req.params.id,
    ])

    if (projectResult.rows.length === 0) {
      throw createError('项目不存在', 404)
    }

    if (projectResult.rows[0].user_id !== req.userId) {
      throw createError('无权修改此项目', 403)
    }

    const savedTasks = await batchCreateOrUpdateTasks(req.params.id, tasks)

    // 更新项目的 updated_at
    await query('UPDATE projects SET updated_at = NOW() WHERE id = $1', [req.params.id])

    res.json({
      success: true,
      data: savedTasks,
    })
  } catch (error) {
    next(error)
  }
})

// 获取项目任务
router.get('/:id/tasks', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // 验证项目权限
    const projectResult = await query('SELECT user_id FROM projects WHERE id = $1', [
      req.params.id,
    ])

    if (projectResult.rows.length === 0) {
      throw createError('项目不存在', 404)
    }

    if (projectResult.rows[0].user_id !== req.userId) {
      throw createError('无权访问此项目', 403)
    }

    const tasks = await getTasksByProjectId(req.params.id)

    res.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    next(error)
  }
})

// 获取项目成员列表（从任务负责人中提取）
router.get('/:id/members', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // 验证项目权限
    const projectResult = await query('SELECT user_id FROM projects WHERE id = $1', [
      req.params.id,
    ])

    if (projectResult.rows.length === 0) {
      throw createError('项目不存在', 404)
    }

    if (projectResult.rows[0].user_id !== req.userId) {
      throw createError('无权访问此项目', 403)
    }

    // 获取项目所有者
    const ownerResult = await query(
      'SELECT id, email, display_name FROM users WHERE id = $1',
      [projectResult.rows[0].user_id]
    )

    // 获取所有任务负责人（去重）
    const tasksResult = await query(
      'SELECT DISTINCT assignee FROM tasks WHERE project_id = $1 AND assignee IS NOT NULL AND assignee != \'\'',
      [req.params.id]
    )

    // 组合成员列表
    const members = [
      {
        id: ownerResult.rows[0].id,
        name: ownerResult.rows[0].display_name,
        email: ownerResult.rows[0].email,
        role: 'owner',
      },
      ...tasksResult.rows.map((row) => ({
        id: row.assignee, // 使用负责人名称作为 ID（因为可能不是系统用户）
        name: row.assignee,
        email: null,
        role: 'member',
      })),
    ]

    // 去重（基于 name）
    const uniqueMembers = members.reduce((acc, member) => {
      if (!acc.find((m) => m.name === member.name)) {
        acc.push(member)
      }
      return acc
    }, [] as typeof members)

    res.json({
      success: true,
      data: uniqueMembers,
    })
  } catch (error) {
    next(error)
  }
})

export default router
