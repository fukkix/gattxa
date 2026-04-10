import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'

const router = Router()

// 临时内存存储（后续替换为数据库）
const projects: any[] = []

// 获取用户的所有项目
router.get('/', authenticate, (req: AuthRequest, res, next) => {
  try {
    const userProjects = projects.filter(p => p.userId === req.userId)
    res.json({
      success: true,
      data: userProjects
    })
  } catch (error) {
    next(error)
  }
})

// 创建项目
router.post('/', authenticate, (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body

    const project = {
      id: `project_${Date.now()}`,
      userId: req.userId,
      name,
      description,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.push(project)

    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
})

// 获取单个项目
router.get('/:id', authenticate, (req: AuthRequest, res, next) => {
  try {
    const project = projects.find(p => p.id === req.params.id)
    
    if (!project) {
      throw createError('项目不存在', 404)
    }

    if (project.userId !== req.userId) {
      throw createError('无权访问此项目', 403)
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
})

// 更新项目
router.put('/:id', authenticate, (req: AuthRequest, res, next) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === req.params.id)
    
    if (projectIndex === -1) {
      throw createError('项目不存在', 404)
    }

    if (projects[projectIndex].userId !== req.userId) {
      throw createError('无权修改此项目', 403)
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: projects[projectIndex]
    })
  } catch (error) {
    next(error)
  }
})

// 删除项目
router.delete('/:id', authenticate, (req: AuthRequest, res, next) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === req.params.id)
    
    if (projectIndex === -1) {
      throw createError('项目不存在', 404)
    }

    if (projects[projectIndex].userId !== req.userId) {
      throw createError('无权删除此项目', 403)
    }

    projects.splice(projectIndex, 1)

    res.json({
      success: true,
      message: '项目已删除'
    })
  } catch (error) {
    next(error)
  }
})

export default router
