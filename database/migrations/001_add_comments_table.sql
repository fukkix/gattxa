-- 添加评论表
-- 迁移版本: 001
-- 创建日期: 2026-04-11
-- 描述: M3 阶段 - 添加评论功能

-- 创建 comments 表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT comments_content_not_empty CHECK (length(trim(content)) > 0)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 创建 GIN 索引以支持 mentions 数组查询
CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING GIN(mentions);

-- 添加注释
COMMENT ON TABLE comments IS '任务评论表';
COMMENT ON COLUMN comments.id IS '评论 ID';
COMMENT ON COLUMN comments.task_id IS '任务 ID';
COMMENT ON COLUMN comments.user_id IS '评论者 ID';
COMMENT ON COLUMN comments.content IS '评论内容';
COMMENT ON COLUMN comments.mentions IS '被 @ 提及的用户 ID 列表';
COMMENT ON COLUMN comments.created_at IS '创建时间';
COMMENT ON COLUMN comments.updated_at IS '更新时间';

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- 插入测试数据（可选）
-- INSERT INTO comments (task_id, user_id, content, mentions)
-- SELECT 
--   t.id,
--   u.id,
--   '这是一条测试评论',
--   ARRAY[]::TEXT[]
-- FROM tasks t
-- CROSS JOIN users u
-- LIMIT 1;

