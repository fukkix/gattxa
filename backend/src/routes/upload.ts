import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { upload, handleUploadError } from '../middleware/upload.js'
import { createError } from '../middleware/errorHandler.js'
import { query } from '../config/database.js'
import path from 'path'

const router = Router()

// 文件上传
router.post(
  '/',
  authenticate,
  upload.single('file'),
  handleUploadError,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        throw createError('未上传文件', 400)
      }

      const { originalname, filename, size, mimetype, path: filePath } = req.file

      // 保存上传记录到数据库
      const result = await query(
        `INSERT INTO parse_records (user_id, file_name, file_path, file_size, status)
         VALUES ($1, $2, $3, $4, 'uploaded')
         RETURNING id, file_name, file_size, status, created_at`,
        [req.userId, originalname, filePath, size]
      )

      const record = result.rows[0]

      res.status(201).json({
        success: true,
        data: {
          id: record.id,
          fileName: record.file_name,
          fileSize: record.file_size,
          status: record.status,
          createdAt: record.created_at,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

// 获取上传历史
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT id, file_name, file_size, status, created_at
       FROM parse_records
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.userId]
    )

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        fileName: row.file_name,
        fileSize: row.file_size,
        status: row.status,
        createdAt: row.created_at,
      })),
    })
  } catch (error) {
    next(error)
  }
})

export default router
