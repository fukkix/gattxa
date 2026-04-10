# GanttFlow 快速启动

## 1. 启动数据库（已完成 ✅）

数据库已成功启动并初始化！

## 2. 配置后端

```powershell
cd backend
cp .env.example .env
```

编辑 `backend/.env` 文件，填写你的 Claude API Key：
```
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

获取 API Key：https://console.anthropic.com/

## 3. 安装并启动后端

```powershell
# 在 backend 目录
npm install
npm run dev
```

后端将运行在 http://localhost:3000

## 4. 安装并启动前端（新终端）

```powershell
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173

## 5. 访问应用

打开浏览器访问：http://localhost:5173

## 测试 AI 文件解析

1. 点击"上传文件"按钮
2. 上传一个包含任务信息的 Excel/Word/CSV 文件
3. 等待 AI 解析
4. 确认字段映射
5. 查看生成的甘特图

## 停止服务

```powershell
# 停止数据库
docker compose down

# 停止前后端：按 Ctrl+C
```

## 常用命令

```powershell
# 查看数据库日志
docker compose logs postgres

# 重启数据库
docker compose restart postgres

# 查看运行中的容器
docker compose ps

# 进入 PostgreSQL
docker exec -it ganttflow-postgres psql -U postgres -d ganttflow
```

## 故障排除

### 端口被占用
```powershell
# 查看端口占用
netstat -ano | findstr :5432
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

### 数据库连接失败
```powershell
# 检查数据库状态
docker compose ps

# 查看数据库日志
docker compose logs postgres
```

### npm install 失败
```powershell
# 清除缓存
npm cache clean --force
rm -rf node_modules
npm install
```
