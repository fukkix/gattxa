import { z } from 'zod'
import { query, getClient } from '../config/database.js'

export const TaskSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  name: z.string().min(1, '任务名称不能为空'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误').nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误').nullable(),
  assignee: z.string(),
  phase: z.string(),
  description: z.string().optional(),
  isMilestone: z.boolean().default(false),
  dependencies: z.array(z.string()).default([]),
  position: z.number().default(0),
})

export type TaskInput = z.infer<typeof TaskSchema>

export interface Task extends TaskInput {
  id: string
  version: number
  createdAt: string
  updatedAt: string
}

export const createTask = async (taskData: TaskInput): Promise<Task> => {
  const validated = TaskSchema.parse(taskData)

  const result = await query(
    `INSERT INTO tasks (
      project_id, name, start_date, end_date, assignee, phase,
      description, is_milestone, dependencies, position, version
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
    RETURNING *`,
    [
      validated.projectId,
      validated.name,
      validated.startDate,
      validated.endDate,
      validated.assignee,
      validated.phase,
      validated.description || null,
      validated.isMilestone,
      JSON.stringify(validated.dependencies),
      validated.position,
    ]
  )

  return mapTaskFromDb(result.rows[0])
}

export const updateTask = async (
  id: string, 
  taskData: Partial<TaskInput>, 
  expectedVersion?: number
): Promise<Task> => {
  const updates: string[] = []
  const values: any[] = []
  let paramCount = 1

  if (taskData.name !== undefined) {
    updates.push(`name = $${paramCount}`)
    values.push(taskData.name)
    paramCount++
  }
  if (taskData.startDate !== undefined) {
    updates.push(`start_date = $${paramCount}`)
    values.push(taskData.startDate)
    paramCount++
  }
  if (taskData.endDate !== undefined) {
    updates.push(`end_date = $${paramCount}`)
    values.push(taskData.endDate)
    paramCount++
  }
  if (taskData.assignee !== undefined) {
    updates.push(`assignee = $${paramCount}`)
    values.push(taskData.assignee)
    paramCount++
  }
  if (taskData.phase !== undefined) {
    updates.push(`phase = $${paramCount}`)
    values.push(taskData.phase)
    paramCount++
  }
  if (taskData.description !== undefined) {
    updates.push(`description = $${paramCount}`)
    values.push(taskData.description)
    paramCount++
  }
  if (taskData.isMilestone !== undefined) {
    updates.push(`is_milestone = $${paramCount}`)
    values.push(taskData.isMilestone)
    paramCount++
  }
  if (taskData.dependencies !== undefined) {
    updates.push(`dependencies = $${paramCount}`)
    values.push(JSON.stringify(taskData.dependencies))
    paramCount++
  }

  // 增加版本号
  updates.push(`version = version + 1`)
  updates.push(`updated_at = NOW()`)
  
  // 添加 ID 参数
  values.push(id)
  const idParam = paramCount
  paramCount++

  // 构建 WHERE 子句
  let whereClause = `id = $${idParam}`
  if (expectedVersion !== undefined) {
    values.push(expectedVersion)
    whereClause += ` AND version = $${paramCount}`
    paramCount++
  }

  const result = await query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE ${whereClause} RETURNING *`,
    values
  )

  if (result.rows.length === 0) {
    if (expectedVersion !== undefined) {
      // 检查任务是否存在
      const checkResult = await query('SELECT version FROM tasks WHERE id = $1', [id])
      if (checkResult.rows.length === 0) {
        throw new Error('Task not found')
      }
      // 版本冲突
      throw new Error('Version conflict')
    }
    throw new Error('Task not found')
  }

  return mapTaskFromDb(result.rows[0])
}

export const deleteTask = async (id: string): Promise<void> => {
  await query('DELETE FROM tasks WHERE id = $1', [id])
}

export const getTasksByProjectId = async (projectId: string): Promise<Task[]> => {
  const result = await query(
    'SELECT * FROM tasks WHERE project_id = $1 ORDER BY position, created_at',
    [projectId]
  )

  return result.rows.map(mapTaskFromDb)
}

export const batchCreateOrUpdateTasks = async (
  projectId: string,
  tasks: TaskInput[]
): Promise<Task[]> => {
  const client = await getClient()

  try {
    await client.query('BEGIN')

    const results: Task[] = []

    for (const taskData of tasks) {
      if (taskData.id) {
        // Update existing task
        const result = await client.query(
          `UPDATE tasks SET
            name = $1, start_date = $2, end_date = $3, assignee = $4,
            phase = $5, description = $6, is_milestone = $7,
            dependencies = $8, position = $9, version = version + 1, updated_at = NOW()
          WHERE id = $10 AND project_id = $11
          RETURNING *`,
          [
            taskData.name,
            taskData.startDate,
            taskData.endDate,
            taskData.assignee,
            taskData.phase,
            taskData.description || null,
            taskData.isMilestone,
            JSON.stringify(taskData.dependencies),
            taskData.position,
            taskData.id,
            projectId,
          ]
        )
        if (result.rows[0]) {
          results.push(mapTaskFromDb(result.rows[0]))
        }
      } else {
        // Create new task
        const result = await client.query(
          `INSERT INTO tasks (
            project_id, name, start_date, end_date, assignee, phase,
            description, is_milestone, dependencies, position, version
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
          RETURNING *`,
          [
            projectId,
            taskData.name,
            taskData.startDate,
            taskData.endDate,
            taskData.assignee,
            taskData.phase,
            taskData.description || null,
            taskData.isMilestone,
            JSON.stringify(taskData.dependencies),
            taskData.position,
          ]
        )
        results.push(mapTaskFromDb(result.rows[0]))
      }
    }

    await client.query('COMMIT')
    return results
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const batchDeleteTasks = async (taskIds: string[]): Promise<void> => {
  await query('DELETE FROM tasks WHERE id = ANY($1)', [taskIds])
}

// Helper function to map database row to Task object
const mapTaskFromDb = (row: any): Task => ({
  id: row.id,
  projectId: row.project_id,
  name: row.name,
  startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : null,
  endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : null,
  assignee: row.assignee,
  phase: row.phase,
  description: row.description,
  isMilestone: row.is_milestone,
  dependencies: typeof row.dependencies === 'string' ? JSON.parse(row.dependencies) : row.dependencies,
  position: row.position,
  version: row.version || 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})
