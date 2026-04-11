# M3 阶段数据库迁移脚本 (PowerShell)
# 用途：添加 comments 表和相关索引

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GanttXa M3 数据库迁移" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 读取环境变量
$envFile = "backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# 数据库连接参数
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "ganttxa" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = $env:DB_PASSWORD

Write-Host "数据库连接信息:" -ForegroundColor Yellow
Write-Host "  主机: $DB_HOST"
Write-Host "  端口: $DB_PORT"
Write-Host "  数据库: $DB_NAME"
Write-Host "  用户: $DB_USER"
Write-Host ""

# 设置 PGPASSWORD 环境变量
$env:PGPASSWORD = $DB_PASSWORD

# 检查 psql 命令是否可用
Write-Host "检查 psql 命令..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ 找不到 psql 命令" -ForegroundColor Red
    Write-Host "请确保 PostgreSQL 客户端工具已安装并添加到 PATH" -ForegroundColor Red
    exit 1
}

# 检查数据库连接
Write-Host "检查数据库连接..." -ForegroundColor Yellow
$testConnection = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\q" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 无法连接到数据库" -ForegroundColor Red
    Write-Host "请确保：" -ForegroundColor Red
    Write-Host "  1. PostgreSQL 服务正在运行" -ForegroundColor Red
    Write-Host "  2. 数据库连接参数正确" -ForegroundColor Red
    Write-Host "  3. 数据库 $DB_NAME 已存在" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 数据库连接成功" -ForegroundColor Green
Write-Host ""

# 执行迁移
Write-Host "执行迁移脚本..." -ForegroundColor Yellow
$migrationFile = "database\migrations\001_add_comments_table.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ 找不到迁移文件: $migrationFile" -ForegroundColor Red
    exit 1
}

& psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migrationFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 迁移成功完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "已添加的表和索引：" -ForegroundColor Green
    Write-Host "  - comments 表"
    Write-Host "  - idx_comments_task_id 索引"
    Write-Host "  - idx_comments_user_id 索引"
    Write-Host "  - idx_comments_created_at 索引"
    Write-Host "  - idx_comments_mentions 索引"
    Write-Host "  - update_comments_updated_at 触发器"
    Write-Host ""
    Write-Host "现在可以使用评论功能了！" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 迁移失败" -ForegroundColor Red
    Write-Host "请检查错误信息并重试" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "迁移完成" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 清除密码环境变量
Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
