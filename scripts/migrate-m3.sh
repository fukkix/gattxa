#!/bin/bash

# M3 阶段数据库迁移脚本
# 用途：添加 comments 表和相关索引

set -e

echo "=========================================="
echo "GanttXa M3 数据库迁移"
echo "=========================================="
echo ""

# 读取环境变量
if [ -f backend/.env ]; then
  export $(cat backend/.env | grep -v '^#' | xargs)
fi

# 数据库连接参数
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-ganttxa}
DB_USER=${DB_USER:-postgres}

echo "数据库连接信息:"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查 PostgreSQL 是否可访问
echo "检查数据库连接..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
  echo "❌ 无法连接到数据库"
  echo "请确保："
  echo "  1. PostgreSQL 服务正在运行"
  echo "  2. 数据库连接参数正确"
  echo "  3. 数据库 $DB_NAME 已存在"
  exit 1
fi

echo "✅ 数据库连接成功"
echo ""

# 执行迁移
echo "执行迁移脚本..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_add_comments_table.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 迁移成功完成！"
  echo ""
  echo "已添加的表和索引："
  echo "  - comments 表"
  echo "  - idx_comments_task_id 索引"
  echo "  - idx_comments_user_id 索引"
  echo "  - idx_comments_created_at 索引"
  echo "  - idx_comments_mentions 索引"
  echo "  - update_comments_updated_at 触发器"
  echo ""
  echo "现在可以使用评论功能了！"
else
  echo ""
  echo "❌ 迁移失败"
  echo "请检查错误信息并重试"
  exit 1
fi

echo ""
echo "=========================================="
echo "迁移完成"
echo "=========================================="
