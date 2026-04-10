import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { createError } from './errorHandler.js'

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳_随机数_原始文件名
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    const basename = path.basename(file.originalname, ext)
    cb(null, `${basename}_${uniqueSuffix}${ext}`)
  },
})

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/csv', // .csv
  ]

  const allowedExtensions = ['.xlsx', '.xls', '.docx', '.csv']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    cb(
      createError(
        `不支持的文件类型: ${file.originalname}。仅支持 .xlsx, .xls, .docx, .csv 文件`,
        400
      )
    )
  }
}

// 配置 multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520'), // 默认 20MB
  },
})

// 错误处理中间件
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: '文件大小超过限制（最大 20MB）',
        },
      })
    }
    return res.status(400).json({
      success: false,
      error: {
        message: `文件上传错误: ${err.message}`,
      },
    })
  }
  next(err)
}
