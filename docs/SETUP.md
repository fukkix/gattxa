# GanttFlow 环境搭建指南

## 前置要求

- Node.js 18+
- Docker & Docker Compose
- Git

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-org/ganttflow.git
cd ganttflow
```

### 2. 使用 Docker Compose 启动（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务地址：
- 前端：http://localhost:5173
- 后端：http://localhost:3000
- PostgreSQL：localhost:5432
- Redis：localhost:6379

### 3. 本地开发（不使用 Docker）

#### 后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写数据库连接等信息

# 启动开发服务器
npm run dev
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 数据库

确保 PostgreSQL 和 Redis 正在运行，然后执行：

```bash
# 初始化数据库
psql -U postgres -d ganttflow -f database/init.sql
```

## 验证安装

### 后端健康检查

```bash
curl http://localhost:3000/health
```

应返回：
```json
{
  "success": true,
  "message": "GanttFlow API is running",
  "timestamp": "2026-04-10T...",
  "environment": "development"
}
```

### 前端访问

打开浏览器访问 http://localhost:5173，应该看到 GanttFlow 首页。

## 常见问题

### 端口冲突

如果端口被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "5174:5173"  # 前端改为 5174
  - "3001:3000"  # 后端改为 3001
```

### 数据库连接失败

检查 PostgreSQL 是否正在运行：

```bash
docker-compose ps postgres
```

查看日志：

```bash
docker-compose logs postgres
```

### 依赖安装失败

清除缓存重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 下一步

- 查看 [开发规范](DEVELOPMENT.md)
- 查看 [API 文档](API.md)
- 开始开发！
