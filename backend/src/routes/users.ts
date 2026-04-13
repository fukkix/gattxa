import express from 'express'
import { pool } from '../config/database.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

// 获取项目成员列表（用于 @ 提及自动补全）
router.get('/projects/:projectId/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const { search } = req.query

    // 获取项目所有者
    const projectResult = await pool.query(
      'SELECT user_id FROM projects WHERE id = $1',
      [projectId]
    )

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' })
    }

    // 获取在该项目中有评论的所有用户
    let query = `
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      WHERE u.id IN (
        SELECT DISTINCT user_id FROM comments c
        JOIN tasks t ON c.task_id = t.id
        WHERE t.project_id = $1
        UNION
        SELECT user_id FROM projects WHERE id = $1
      )
    `
    const params: any[] = [projectId]

    // 如果有搜索关键词，添加过滤
    if (search && typeof search === 'string') {
      query += ' AND (u.name ILIKE $2 OR u.email ILIKE $2)'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY u.name LIMIT 20'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('获取项目成员失败:', error)
    res.status(500).json({ error: '获取项目成员失败' })
  }
})

// 搜索所有用户（用于 @ 提及自动补全）
router.get('/users/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: '请提供搜索关键词' })
    }

    const result = await pool.query(
      `SELECT id, name, email 
       FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY name
       LIMIT 10`,
      [`%${q}%`]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('搜索用户失败:', error)
    res.status(500).json({ error: '搜索用户失败' })
  }
})

// 获取当前用户的通知（@ 提及）
router.get('/notifications', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { unreadOnly } = req.query

    let query = `
      SELECT 
        c.id as comment_id,
        c.content,
        c.created_at,
        c.task_id,
        t.name as task_name,
        t.project_id,
        p.name as project_name,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM comment_reads cr 
            WHERE cr.comment_id = c.id AND cr.user_id = $1
          ) THEN true 
          ELSE false 
        END as is_read
      FROM comments c
      JOIN tasks t ON c.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON c.user_id = u.id
      WHERE $1 = ANY(c.mentions)
    `

    if (unreadOnly === 'true') {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM comment_reads cr 
        WHERE cr.comment_id = c.id AND cr.user_id = $1
      )`
    }

    query += ' ORDER BY c.created_at DESC LIMIT 50'

    const result = await pool.query(query, [userId])
    res.json(result.rows)
  } catch (error) {
    console.error('获取通知失败:', error)
    res.status(500).json({ error: '获取通知失败' })
  }
})

// 标记通知为已读
router.post('/notifications/:commentId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { commentId } = req.params
    const userId = req.userId!

    await pool.query(
      `INSERT INTO comment_reads (comment_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (comment_id, user_id) DO NOTHING`,
      [commentId, userId]
    )

    res.json({ message: '已标记为已读' })
  } catch (error) {
    console.error('标记已读失败:', error)
    res.status(500).json({ error: '标记已读失败' })
  }
})

// 标记所有通知为已读
router.post('/notifications/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    await pool.query(
      `INSERT INTO comment_reads (comment_id, user_id)
       SELECT c.id, $1
       FROM comments c
       WHERE $1 = ANY(c.mentions)
       ON CONFLICT (comment_id, user_id) DO NOTHING`,
      [userId]
    )

    res.json({ message: '已全部标记为已读' })
  } catch (error) {
    console.error('标记全部已读失败:', error)
    res.status(500).json({ error: '标记全部已读失败' })
  }
})

export default router
