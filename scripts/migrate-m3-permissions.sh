#!/bin/bash

# M3 权限管理数据库迁移脚本
# 用途：添加项目成员和邀请表以支持权限管理功能

set -e

echo "=========================================="
echo "GanttXa M3 权限管理数据库迁移"
echo "=========================================="
echo ""

# 从 .env 文件读取数据库配置
if [ -f backend/.env ]; then
  export $(cat backend/.env | grep -v '^#' | xargs)
else
  echo "❌ 错误: 找不到 backend/.env 文件"
  exit 1
fi

# 设置数据库连接信息
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-ganttxa}
DB_USER=${DB_USER:-postgres}

echo "📊 数据库信息:"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查 PostgreSQL 是否可访问
echo "🔍 检查数据库连接..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
  echo "❌ 错误: 无法连接到数据库"
  echo "请确保:"
  echo "  1. PostgreSQL 服务正在运行"
  echo "  2. .env 文件中的数据库配置正确"
  echo "  3. 数据库 $DB_NAME 已存在"
  exit 1
fi
echo "✅ 数据库连接成功"
echo ""

# 执行迁移
echo "🚀 开始执行迁移..."
echo ""

echo "📝 创建项目成员和邀请表..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/003_add_project_members_table.sql

if [ $? -eq 0 ]; then
  echo "✅ 项目成员和邀请表创建成功"
else
  echo "❌ 项目成员和邀请表创建失败"
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ M3 权限管理迁移完成！"
echo "=========================================="
echo ""
echo "📋 已添加的功能:"
echo "  ✅ project_members 表（项目成员）"
echo "  ✅ project_invitations 表（项目邀请）"
echo "  ✅ 相关索引"
echo "  ✅ 为现有项目添加所有者成员记录"
echo ""
echo "🎉 现在可以使用项目成员管理功能了！"
echo ""
