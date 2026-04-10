import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { query } from '../config/database.js'
import { parseFileWithAI, validateParseResult, calculateAccuracy } from '../services/aiParser.js'
import fs from 'fs/promises'

const router = Router()

// 触发文件解析
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { fileId, fileContent, provider, apiKey, model } = req.body

    if (!fileId) {
      throw createError('缺少 fileId', 400)
    }

    if (!fileContent) {
      throw createError('缺少 fileContent', 400)
    }

    if (!provider || !apiKey || !model) {
      throw createError('缺少 AI 配置参数 (provider, apiKey, model)', 400)
    }

    // 验证文件记录存在且属于当前用户
    const recordResult = await query(
      'SELECT * FROM parse_records WHERE id = $1 AND user_id = $2',
      [fileId, req.userId]
    )

    if (recordResult.rows.length === 0) {
      throw createError('文件记录不存在', 404)
    }

    const record = recordResult.rows[0]

    // 更新状态为解析中
    await query('UPDATE parse_records SET status = $1, updated_at = NOW() WHERE id = $2', [
      'processing',
      fileId,
    ])

    try {
      // 调用 AI 解析
      const parseResult = await parseFileWithAI(fileContent, record.file_name, {
        provider,
        apiKey,
        model,
      })

      // 验证解析结果
      const errors = validateParseResult(parseResult)
      const accuracy = calculateAccuracy(parseResult)

      // 保存解析结果
      await query(
        `UPDATE parse_records
         SET status = $1, result = $2, updated_at = NOW()
         WHERE id = $3`,
        ['completed', JSON.stringify(parseResult), fileId]
      )

      res.json({
        success: true,
        data: {
          id: fileId,
          status: 'completed',
          result: parseResult,
          accuracy,
          errors: errors.length > 0 ? errors : undefined,
        },
      })
    } catch (parseError: any) {
      // 解析失败，更新状态
      await query(
        'UPDATE parse_records SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        ['failed', parseError.message, fileId]
      )

      throw createError(`解析失败: ${parseError.message}`, 500)
    }
  } catch (error) {
    next(error)
  }
})

// 查询解析状态
router.get('/:id/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT id, file_name, status, result, error_message, created_at, updated_at FROM parse_records WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    )

    if (result.rows.length === 0) {
      throw createError('解析记录不存在', 404)
    }

    const record = result.rows[0]

    res.json({
      success: true,
      data: {
        id: record.id,
        fileName: record.file_name,
        status: record.status,
        result: record.result,
        errorMessage: record.error_message,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 更新字段映射
router.put('/:id/mapping', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { fieldMapping } = req.body

    if (!fieldMapping || typeof fieldMapping !== 'object') {
      throw createError('缺少 fieldMapping', 400)
    }

    // 获取原始解析结果
    const recordResult = await query(
      'SELECT result FROM parse_records WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    )

    if (recordResult.rows.length === 0) {
      throw createError('解析记录不存在', 404)
    }

    const originalResult = recordResult.rows[0].result

    // 更新字段映射
    const updatedResult = {
      ...originalResult,
      fieldMapping,
    }

    // 保存更新后的结果
    await query(
      'UPDATE parse_records SET result = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedResult), req.params.id]
    )

    res.json({
      success: true,
      data: updatedResult,
    })
  } catch (error) {
    next(error)
  }
})

// 删除解析记录（同时删除文件）
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const recordResult = await query(
      'SELECT file_path FROM parse_records WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    )

    if (recordResult.rows.length === 0) {
      throw createError('解析记录不存在', 404)
    }

    const filePath = recordResult.rows[0].file_path

    // 删除数据库记录
    await query('DELETE FROM parse_records WHERE id = $1', [req.params.id])

    // 删除文件
    try {
      await fs.unlink(filePath)
    } catch (fileError) {
      console.error('Failed to delete file:', fileError)
      // 文件删除失败不影响数据库记录删除
    }

    res.json({
      success: true,
      message: '解析记录已删除',
    })
  } catch (error) {
    next(error)
  }
})

export default router
