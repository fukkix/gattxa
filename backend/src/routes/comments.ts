import express from 'express'
import { CommentModel } from '../models/Comment'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = express.Router()

// 创建评论
router.post('/tasks/:taskId/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params
    const { content, mentions = [] } = req.body
    const userId = req.userId!

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }

    const comment = await CommentModel.create(taskId, userId, content, mentions)
    res.status(201).json(comment)
  } catch (error) {
    console.error('创建评论失败:', error)
    res.status(500).json({ error: '创建评论失败' })
  }
})

// 获取任务的评论
router.get('/tasks/:taskId/comments', async (req, res) => {
  try {
    const { taskId } = req.params
    const comments = await CommentModel.findByTaskId(taskId)
    res.json(comments)
  } catch (error) {
    console.error('获取评论失败:', error)
    res.status(500).json({ error: '获取评论失败' })
  }
})

// 获取项目的所有评论
router.get('/projects/:projectId/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params
    const comments = await CommentModel.findByProjectId(projectId)
    res.json(comments)
  } catch (error) {
    console.error('获取项目评论失败:', error)
    res.status(500).json({ error: '获取项目评论失败' })
  }
})

// 更新评论
router.put('/comments/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const userId = req.userId!

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }

    const comment = await CommentModel.update(id, userId, content)
    if (!comment) {
      return res.status(404).json({ error: '评论不存在或无权限' })
    }

    res.json(comment)
  } catch (error) {
    console.error('更新评论失败:', error)
    res.status(500).json({ error: '更新评论失败' })
  }
})

// 删除评论
router.delete('/comments/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.userId!

    const success = await CommentModel.delete(id, userId)
    if (!success) {
      return res.status(404).json({ error: '评论不存在或无权限' })
    }

    res.json({ message: '评论已删除' })
  } catch (error) {
    console.error('删除评论失败:', error)
    res.status(500).json({ error: '删除评论失败' })
  }
})

// 获取用户的 @ 提及
router.get('/mentions', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const mentions = await CommentModel.findMentions(userId)
    res.json(mentions)
  } catch (error) {
    console.error('获取提及失败:', error)
    res.status(500).json({ error: '获取提及失败' })
  }
})

export default router
