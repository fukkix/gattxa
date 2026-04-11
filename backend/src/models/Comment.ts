import pool from '../config/database'

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  mentions: string[] // 被 @ 的用户 ID
  created_at: Date
  updated_at: Date
}

export interface CommentWithUser extends Comment {
  user_name: string
  user_email: string
}

export const CommentModel = {
  // 创建评论
  async create(
    taskId: string,
    userId: string,
    content: string,
    mentions: string[] = []
  ): Promise<Comment> {
    const result = await pool.query(
      `INSERT INTO comments (task_id, user_id, content, mentions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [taskId, userId, content, mentions]
    )
    return result.rows[0]
  },

  // 获取任务的所有评论
  async findByTaskId(taskId: string): Promise<CommentWithUser[]> {
    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    )
    return result.rows
  },

  // 获取项目的所有评论
  async findByProjectId(projectId: string): Promise<CommentWithUser[]> {
    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, t.name as task_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN tasks t ON c.task_id = t.id
       WHERE t.project_id = $1
       ORDER BY c.created_at DESC`,
      [projectId]
    )
    return result.rows
  },

  // 更新评论
  async update(id: string, userId: string, content: string): Promise<Comment | null> {
    const result = await pool.query(
      `UPDATE comments
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [content, id, userId]
    )
    return result.rows[0] || null
  },

  // 删除评论
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return result.rowCount! > 0
  },

  // 获取用户被 @ 的评论
  async findMentions(userId: string): Promise<CommentWithUser[]> {
    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, t.name as task_name, p.name as project_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN tasks t ON c.task_id = t.id
       JOIN projects p ON t.project_id = p.id
       WHERE $1 = ANY(c.mentions)
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [userId]
    )
    return result.rows
  }
}
