import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GanttFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

export default router
