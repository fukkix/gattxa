import express from 'express'
import { pool } from '../config/database.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import crypto from 'crypto'

const router = express.Router()

// 获取项目成员列表
router.get('/projects/:projectId/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!

    // 检查用户是否有权限查看成员
    const memberCheck = await pool.query(
      `SELECT role, permissions FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: '无权限查看项目成员' })
    }

    // 获取所有成员
    const result = await pool.query(
      `SELECT 
        pm.id,
        pm.user_id,
        pm.role,
        pm.permissions,
        pm.joined_at,
        pm.status,
        u.name as user_name,
        u.email as user_email,
        inviter.name as invited_by_name
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN users inviter ON pm.invited_by = inviter.id
      WHERE pm.project_id = $1
      ORDER BY 
        CASE pm.role 
          WHEN 'owner' THEN 1 
          WHEN 'admin' THEN 2 
          WHEN 'member' THEN 3 
          WHEN 'viewer' THEN 4 
        END,
        pm.joined_at ASC`,
      [projectId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('获取项目成员失败:', error)
    res.status(500).json({ error: '获取项目成员失败' })
  }
})

// 邀请成员
router.post('/projects/:projectId/invitations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const { email, role = 'member', permissions } = req.body
    const userId = req.userId!

    // 检查用户是否有管理权限
    const memberCheck = await pool.query(
      `SELECT role, permissions FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: '无权限邀请成员' })
    }

    const member = memberCheck.rows[0]
    if (!member.permissions.manage && member.role !== 'owner' && member.role !== 'admin') {
      return res.status(403).json({ error: '无权限邀请成员' })
    }

    // 检查邮箱是否已经是成员
    const existingMember = await pool.query(
      `SELECT pm.* FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND u.email = $2`,
      [projectId, email]
    )

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: '该用户已经是项目成员' })
    }

    // 检查是否已有待处理的邀请
    const existingInvitation = await pool.query(
      `SELECT * FROM project_invitations
       WHERE project_id = $1 AND email = $2 AND status = 'pending'`,
      [projectId, email]
    )

    if (existingInvitation.rows.length > 0) {
      return res.status(400).json({ error: '该邮箱已有待处理的邀请' })
    }

    // 生成邀请 token
    const token = crypto.randomBytes(32).toString('hex')

    // 设置默认权限
    const defaultPermissions = permissions || {
      view: true,
      comment: role !== 'viewer',
      edit: role === 'admin' || role === 'member',
      manage: role === 'admin'
    }

    // 创建邀请
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7天后过期

    const result = await pool.query(
      `INSERT INTO project_invitations 
       (project_id, email, role, permissions, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId, email, role, defaultPermissions, token, userId, expiresAt]
    )

    const invitation = result.rows[0]

    // TODO: 发送邀请邮件
    const appUrl = process.env.APP_URL || 'http://localhost:5173'
    const invitationUrl = `${appUrl}/invitation/${token}`

    res.status(201).json({
      ...invitation,
      invitation_url: invitationUrl
    })
  } catch (error) {
    console.error('邀请成员失败:', error)
    res.status(500).json({ error: '邀请成员失败' })
  }
})

// 获取项目邀请列表
router.get('/projects/:projectId/invitations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!

    // 检查权限
    const memberCheck = await pool.query(
      `SELECT role, permissions FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: '无权限查看邀请' })
    }

    const member = memberCheck.rows[0]
    if (!member.permissions.manage && member.role !== 'owner' && member.role !== 'admin') {
      return res.status(403).json({ error: '无权限查看邀请' })
    }

    // 获取邀请列表
    const result = await pool.query(
      `SELECT 
        pi.*,
        u.name as invited_by_name
      FROM project_invitations pi
      JOIN users u ON pi.invited_by = u.id
      WHERE pi.project_id = $1
      ORDER BY pi.invited_at DESC`,
      [projectId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('获取邀请列表失败:', error)
    res.status(500).json({ error: '获取邀请列表失败' })
  }
})

// 获取邀请信息（无需认证）
router.get('/invitations/:token', async (req, res) => {
  try {
    const { token } = req.params

    // 获取邀请信息
    const result = await pool.query(
      `SELECT 
        pi.id,
        pi.project_id,
        pi.email,
        pi.role,
        pi.invited_at,
        pi.expires_at,
        pi.status,
        p.name as project_name,
        u.name as invited_by_name
      FROM project_invitations pi
      JOIN projects p ON pi.project_id = p.id
      JOIN users u ON pi.invited_by = u.id
      WHERE pi.token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '邀请不存在' })
    }

    const invitation = result.rows[0]

    // 检查是否过期
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      // 自动更新状态为过期
      await pool.query(
        `UPDATE project_invitations SET status = 'expired' WHERE id = $1`,
        [invitation.id]
      )
      invitation.status = 'expired'
    }

    res.json(invitation)
  } catch (error) {
    console.error('获取邀请信息失败:', error)
    res.status(500).json({ error: '获取邀请信息失败' })
  }
})

// 接受邀请
router.post('/invitations/:token/accept', authenticate, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params
    const userId = req.userId!

    // 获取邀请信息
    const invitationResult = await pool.query(
      `SELECT pi.*, u.email as user_email
       FROM project_invitations pi
       JOIN users u ON u.id = $1
       WHERE pi.token = $2 AND pi.status = 'pending'`,
      [userId, token]
    )

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: '邀请不存在或已失效' })
    }

    const invitation = invitationResult.rows[0]

    // 检查邮箱是否匹配
    if (invitation.email !== invitation.user_email) {
      return res.status(403).json({ error: '邀请邮箱与当前用户不匹配' })
    }

    // 检查是否过期
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await pool.query(
        `UPDATE project_invitations SET status = 'expired' WHERE id = $1`,
        [invitation.id]
      )
      return res.status(410).json({ error: '邀请已过期' })
    }

    // 检查是否已经是成员
    const existingMember = await pool.query(
      `SELECT * FROM project_members 
       WHERE project_id = $1 AND user_id = $2`,
      [invitation.project_id, userId]
    )

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: '您已经是项目成员' })
    }

    // 添加为成员
    const memberResult = await pool.query(
      `INSERT INTO project_members 
       (project_id, user_id, role, permissions, invited_by, joined_at, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), 'active')
       RETURNING *`,
      [invitation.project_id, userId, invitation.role, invitation.permissions, invitation.invited_by]
    )

    // 更新邀请状态
    await pool.query(
      `UPDATE project_invitations 
       SET status = 'accepted', accepted_at = NOW() 
       WHERE id = $1`,
      [invitation.id]
    )

    res.json(memberResult.rows[0])
  } catch (error) {
    console.error('接受邀请失败:', error)
    res.status(500).json({ error: '接受邀请失败' })
  }
})

// 撤销邀请
router.delete('/invitations/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    // 检查权限
    const invitationResult = await pool.query(
      `SELECT pi.*, pm.role, pm.permissions
       FROM project_invitations pi
       JOIN project_members pm ON pi.project_id = pm.project_id
       WHERE pi.id = $1 AND pm.user_id = $2 AND pm.status = 'active'`,
      [id, userId]
    )

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: '邀请不存在或无权限' })
    }

    const invitation = invitationResult.rows[0]
    if (!invitation.permissions.manage && invitation.role !== 'owner' && invitation.role !== 'admin') {
      return res.status(403).json({ error: '无权限撤销邀请' })
    }

    // 撤销邀请
    await pool.query(
      `UPDATE project_invitations SET status = 'revoked' WHERE id = $1`,
      [id]
    )

    res.json({ message: '邀请已撤销' })
  } catch (error) {
    console.error('撤销邀请失败:', error)
    res.status(500).json({ error: '撤销邀请失败' })
  }
})

// 更新成员角色和权限
router.put('/projects/:projectId/members/:memberId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId, memberId } = req.params
    const { role, permissions } = req.body
    const userId = req.userId!

    // 检查操作者权限
    const operatorCheck = await pool.query(
      `SELECT role, permissions FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (operatorCheck.rows.length === 0) {
      return res.status(403).json({ error: '无权限修改成员' })
    }

    const operator = operatorCheck.rows[0]
    if (!operator.permissions.manage && operator.role !== 'owner' && operator.role !== 'admin') {
      return res.status(403).json({ error: '无权限修改成员' })
    }

    // 获取目标成员信息
    const targetMember = await pool.query(
      `SELECT * FROM project_members WHERE id = $1 AND project_id = $2`,
      [memberId, projectId]
    )

    if (targetMember.rows.length === 0) {
      return res.status(404).json({ error: '成员不存在' })
    }

    // 不能修改所有者
    if (targetMember.rows[0].role === 'owner') {
      return res.status(403).json({ error: '不能修改项目所有者' })
    }

    // 不能修改自己
    if (targetMember.rows[0].user_id === userId) {
      return res.status(403).json({ error: '不能修改自己的角色' })
    }

    // 更新成员
    const result = await pool.query(
      `UPDATE project_members 
       SET role = COALESCE($1, role),
           permissions = COALESCE($2, permissions)
       WHERE id = $3
       RETURNING *`,
      [role, permissions, memberId]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('更新成员失败:', error)
    res.status(500).json({ error: '更新成员失败' })
  }
})

// 移除成员
router.delete('/projects/:projectId/members/:memberId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId, memberId } = req.params
    const userId = req.userId!

    // 检查操作者权限
    const operatorCheck = await pool.query(
      `SELECT role, permissions FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (operatorCheck.rows.length === 0) {
      return res.status(403).json({ error: '无权限移除成员' })
    }

    const operator = operatorCheck.rows[0]
    if (!operator.permissions.manage && operator.role !== 'owner' && operator.role !== 'admin') {
      return res.status(403).json({ error: '无权限移除成员' })
    }

    // 获取目标成员信息
    const targetMember = await pool.query(
      `SELECT * FROM project_members WHERE id = $1 AND project_id = $2`,
      [memberId, projectId]
    )

    if (targetMember.rows.length === 0) {
      return res.status(404).json({ error: '成员不存在' })
    }

    // 不能移除所有者
    if (targetMember.rows[0].role === 'owner') {
      return res.status(403).json({ error: '不能移除项目所有者' })
    }

    // 删除成员
    await pool.query(
      `DELETE FROM project_members WHERE id = $1`,
      [memberId]
    )

    res.json({ message: '成员已移除' })
  } catch (error) {
    console.error('移除成员失败:', error)
    res.status(500).json({ error: '移除成员失败' })
  }
})

// 离开项目
router.post('/projects/:projectId/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!

    // 获取成员信息
    const memberResult = await pool.query(
      `SELECT * FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, userId]
    )

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: '您不是项目成员' })
    }

    const member = memberResult.rows[0]

    // 所有者不能离开项目
    if (member.role === 'owner') {
      return res.status(403).json({ error: '项目所有者不能离开项目，请先转让所有权' })
    }

    // 删除成员记录
    await pool.query(
      `DELETE FROM project_members WHERE id = $1`,
      [member.id]
    )

    res.json({ message: '已离开项目' })
  } catch (error) {
    console.error('离开项目失败:', error)
    res.status(500).json({ error: '离开项目失败' })
  }
})

// 转让项目所有权
router.post('/projects/:projectId/transfer', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const { newOwnerId } = req.body
    const userId = req.userId!

    // 检查当前用户是否是所有者
    const ownerCheck = await pool.query(
      `SELECT * FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND role = 'owner' AND status = 'active'`,
      [projectId, userId]
    )

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: '只有项目所有者可以转让所有权' })
    }

    // 检查新所有者是否是成员
    const newOwnerCheck = await pool.query(
      `SELECT * FROM project_members 
       WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
      [projectId, newOwnerId]
    )

    if (newOwnerCheck.rows.length === 0) {
      return res.status(404).json({ error: '新所有者不是项目成员' })
    }

    // 开始事务
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 将当前所有者改为管理员
      await client.query(
        `UPDATE project_members 
         SET role = 'admin',
             permissions = '{"view": true, "comment": true, "edit": true, "manage": true}'::jsonb
         WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      )

      // 将新成员设为所有者
      await client.query(
        `UPDATE project_members 
         SET role = 'owner',
             permissions = '{"view": true, "comment": true, "edit": true, "manage": true}'::jsonb
         WHERE project_id = $1 AND user_id = $2`,
        [projectId, newOwnerId]
      )

      // 更新项目表的 user_id
      await client.query(
        `UPDATE projects SET user_id = $1 WHERE id = $2`,
        [newOwnerId, projectId]
      )

      await client.query('COMMIT')

      res.json({ message: '所有权已转让' })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('转让所有权失败:', error)
    res.status(500).json({ error: '转让所有权失败' })
  }
})

export default router
