-- 添加版本号字段到任务表
-- 用于实现乐观锁（Optimistic Locking）

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- 为现有任务设置初始版本号
UPDATE tasks SET version = 1 WHERE version IS NULL;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_version ON tasks(id, version);

-- 添加注释
COMMENT ON COLUMN tasks.version IS '任务版本号，用于冲突检测';

