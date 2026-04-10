import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { updateTask, deleteTask, batchDeleteTasks } from '../models/Task.js'
import { query } from '../config/database.js'

const router = Router()

// 更新单个任务
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // 验证任务所属项目的权限
    const taskResult = await query(
      `SELECT t.*, p.user_id FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [req.params.id]
    )

    if (taskResult.rows.length === 0) {
      throw createError('任务不存在', 404)
    }

    if (taskResult.rows[0].user_id !== req.userId) {
      throw createError('无权修改此任务', 403)
    }

    const updatedTask = await updateTask(req.params.id, req.body)

    // 更新项目的 updated_at
    await query('UPDATE projects SET updated_at = NOW() WHERE id = $1', [
      updatedTask.projectId,
    ])

    res.json({
      success: true,
      data: updatedTask,
    })
  } catch (error) {
    next(error)
  }
})

// 删除任务
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // 验证任务所属项目的权限
    const taskResult = await query(
      `SELECT t.project_id, p.user_id FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [req.params.id]
    )

    if (taskResult.rows.length === 0) {
      throw createError('任务不存在', 404)
    }

    if (taskResult.rows[0].user_id !== req.userId) {
      throw createError('无权删除此任务', 403)
    }

    const projectId = taskResult.rows[0].project_id

    await deleteTask(req.params.id)

    // 更新项目的 updated_at
    await query('UPDATE projects SET updated_at = NOW() WHERE id = $1', [projectId])

    res.json({
      success: true,
      message: '任务已删除',
    })
  } catch (error) {
    next(error)
  }
})

// 批量删除任务
router.post('/batch-delete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { taskIds } = req.body

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw createError('taskIds 必须是非空数组', 400)
    }

    // 验证所有任务的权限
    const tasksResult = await query(
      `SELECT DISTINCT p.user_id, t.project_id FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ANY($1)`,
      [taskIds]
    )

    if (tasksResult.rows.some((row: any) => row.user_id !== req.userId)) {
      throw createError('无权删除部分任务', 403)
    }

    const projectIds = tasksResult.rows.map((row: any) => row.project_id)

    await batchDeleteTasks(taskIds)

    // 更新相关项目的 updated_at
    if (projectIds.length > 0) {
      await query('UPDATE projects SET updated_at = NOW() WHERE id = ANY($1)', [projectIds])
    }

    res.json({
      success: true,
      message: `已删除 ${taskIds.length} 个任务`,
    })
  } catch (error) {
    next(error)
  }
})

export default router
