-- 创建评论已读记录表
CREATE TABLE IF NOT EXISTS comment_reads (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_comment_reads_user_id ON comment_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reads_comment_id ON comment_reads(comment_id);

-- 添加注释
COMMENT ON TABLE comment_reads IS '评论已读记录表';
COMMENT ON COLUMN comment_reads.comment_id IS '评论ID';
COMMENT ON COLUMN comment_reads.user_id IS '用户ID';
COMMENT ON COLUMN comment_reads.read_at IS '已读时间';
