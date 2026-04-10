# GanttFlow 快速开始指南

## 前置要求

- Node.js 18+
- Docker Desktop（已安装并运行）
- Git

## 快速启动（推荐）

### Windows 用户

```powershell
# 1. 启动开发环境（数据库）
.\start-dev.ps1

# 2. 启动后端（新终端）
cd backend
cp .env.example .env
# 编辑 .env 文件，填写 CLAUDE_API_KEY
npm install
npm run dev

# 3. 启动前端（新终端）
cd frontend
npm install
npm run dev
```

### Mac/Linux 用户

```bash
# 1. 启动数据库
docker compose up -d postgres redis

# 2. 初始化数据库
docker exec ganttflow-postgres psql -U postgres -c "CREATE DATABASE ganttflow;"
cat database/init.sql | docker exec -i ganttflow-postgres psql -U postgres -d ganttflow

# 3. 插入测试数据（可选）
cat database/seed.sql | docker exec -i ganttflow-postgres psql -U postgres -d ganttflow

# 4. 启动后端
cd backend
cp .env.example .env
# 编辑 .env 文件，填写 CLAUDE_API_KEY
npm install
npm run dev

# 5. 启动前端
cd frontend
npm install
npm run dev
```

## 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000
- 健康检查：http://localhost:3000/health

## 获取 Claude API Key

1. 访问 https://console.anthropic.com/
2. 注册/登录账户
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 Key 并填写到 `backend/.env` 文件中

```env
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

## 停止开发环境

### Windows
```powershell
.\stop-dev.ps1
```

### Mac/Linux
```bash
docker compose down
```

## 常见问题

### 1. Docker 命令不可用

**问题：** `docker-compose: command not found`

**解决：** 
- 新版 Docker Desktop 使用 `docker compose`（空格）而不是 `docker-compose`（连字符）
- 或者安装 Docker Compose V1：https://docs.docker.com/compose/install/

### 2. 端口被占用

**问题：** `port is already allocated`

**解决：**
```powershell
# 查看端口占用
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# 停止占用端口的进程或修改 docker-compose.yml 中的端口映射
```

### 3. 数据库连接失败

**问题：** `ECONNREFUSED 127.0.0.1:5432`

**解决：**
```powershell
# 检查数据库是否运行
docker compose ps

# 查看数据库日志
docker compose logs postgres

# 重启数据库
docker compose restart postgres
```

### 4. npm install 失败

**问题：** 依赖安装失败

**解决：**
```powershell
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 5. AI 解析失败

**问题：** `AI 解析失败: Invalid API key`

**解决：**
- 检查 `backend/.env` 中的 `CLAUDE_API_KEY` 是否正确
- 确保 API Key 有效且有足够的配额
- 检查网络连接

## 开发工具推荐

- **VS Code 扩展：**
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense
  - Docker

- **数据库工具：**
  - DBeaver
  - pgAdmin
  - TablePlus

- **API 测试：**
  - Postman
  - REST Client (VS Code 扩展)

## 项目结构

```
ganttflow/
├── frontend/           # React 前端
│   ├── src/
│   │   ├── components/ # 组件
│   │   ├── pages/      # 页面
│   │   ├── store/      # 状态管理
│   │   ├── utils/      # 工具函数
│   │   └── api/        # API 客户端
│   └── package.json
├── backend/            # Node.js 后端
│   ├── src/
│   │   ├── routes/     # 路由
│   │   ├── models/     # 数据模型
│   │   ├── services/   # 业务逻辑
│   │   └── middleware/ # 中间件
│   └── package.json
├── database/           # 数据库脚本
│   ├── init.sql        # 初始化
│   └── seed.sql        # 测试数据
└── docker-compose.yml  # Docker 配置
```

## 下一步

- 查看 [API 文档](docs/API.md)
- 查看 [开发计划](GanttFlow_开发计划.md)
- 查看 [产品需求](Ganttxa_PRD.docx)

## 获取帮助

- GitHub Issues: https://github.com/fukkix/gattxa/issues
- 项目文档: [docs/](docs/)
