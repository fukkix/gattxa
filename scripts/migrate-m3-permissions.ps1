# M3 权限管理数据库迁移脚本 (Windows PowerShell)
# 用途：添加项目成员和邀请表以支持权限管理功能

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GanttXa M3 权限管理数据库迁移" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 从 .env 文件读取数据库配置
$envFile = "backend\.env"
if (-not (Test-Path $envFile)) {
  Write-Host "❌ 错误: 找不到 backend\.env 文件" -ForegroundColor Red
  exit 1
}

# 读取环境变量
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    Set-Item -Path "env:$name" -Value $value
  }
}

# 设置数据库连接信息
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "ganttxa" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = $env:DB_PASSWORD

Write-Host "📊 数据库信息:" -ForegroundColor Yellow
Write-Host "  主机: $DB_HOST"
Write-Host "  端口: $DB_PORT"
Write-Host "  数据库: $DB_NAME"
Write-Host "  用户: $DB_USER"
Write-Host ""

# 设置 PostgreSQL 密码环境变量
$env:PGPASSWORD = $DB_PASSWORD

# 检查 psql 命令是否可用
Write-Host "🔍 检查 psql 命令..." -ForegroundColor Yellow
try {
  $null = Get-Command psql -ErrorAction Stop
  Write-Host "✅ psql 命令可用" -ForegroundColor Green
} catch {
  Write-Host "❌ 错误: 找不到 psql 命令" -ForegroundColor Red
  Write-Host "请确保 PostgreSQL 已安装并添加到 PATH 环境变量" -ForegroundColor Red
  exit 1
}

# 检查数据库连接
Write-Host "🔍 检查数据库连接..." -ForegroundColor Yellow
$testConnection = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\q" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ 错误: 无法连接到数据库" -ForegroundColor Red
  Write-Host "请确保:" -ForegroundColor Red
  Write-Host "  1. PostgreSQL 服务正在运行" -ForegroundColor Red
  Write-Host "  2. .env 文件中的数据库配置正确" -ForegroundColor Red
  Write-Host "  3. 数据库 $DB_NAME 已存在" -ForegroundColor Red
  exit 1
}
Write-Host "✅ 数据库连接成功" -ForegroundColor Green
Write-Host ""

# 执行迁移
Write-Host "🚀 开始执行迁移..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 创建项目成员和邀请表..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database\migrations\003_add_project_members_table.sql

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ 项目成员和邀请表创建成功" -ForegroundColor Green
} else {
  Write-Host "❌ 项目成员和邀请表创建失败" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ M3 权限管理迁移完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 已添加的功能:" -ForegroundColor Yellow
Write-Host "  ✅ project_members 表（项目成员）"
Write-Host "  ✅ project_invitations 表（项目邀请）"
Write-Host "  ✅ 相关索引"
Write-Host "  ✅ 为现有项目添加所有者成员记录"
Write-Host ""
Write-Host "🎉 现在可以使用项目成员管理功能了！" -ForegroundColor Green
Write-Host ""
