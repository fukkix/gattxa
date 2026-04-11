# GanttXa 快速开始指南

欢迎使用 GanttXa！这份指南将帮助你在 5 分钟内启动并运行项目。

## 前置要求

确保你的系统已安装：

- **Node.js** 18+ ([下载](https://nodejs.org/))
- **Docker** 和 **Docker Compose** ([下载](https://www.docker.com/))
- **Git** ([下载](https://git-scm.com/))

## 快速启动

### 1. 克隆仓库

```bash
git clone https://github.com/fukkix/gattxa.git
cd gattxa
```

### 2. 启动数据库服务

使用 Docker Compose 一键启动 PostgreSQL 和 Redis：

```bash
docker compose up -d
```

等待几秒钟，确保服务启动完成：

```bash
docker compose ps
```

你应该看到 `postgres` 和 `redis` 服务都在运行。

### 3. 配置后端

```bash
cd backend

# 复制环境变量文件
cp .env.example .env

# 安装依赖
npm install

# 运行数据库迁移
npm run migrate

# 启动后端开发服务器
npm run dev
```

后端服务将在 `http://localhost:3000` 启动。

### 4. 配置前端

打开新的终端窗口：

```bash
cd frontend

# 安装依赖
npm install

# 启动前端开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 5. 访问应用

打开浏览器访问：

```
http://localhost:5173
```

🎉 恭喜！你已经成功启动 GanttXa！

## 首次使用

### 注册账号

1. 点击右上角的"注册"按钮
2. 填写用户名、邮箱和密码
3. 点击"注册"完成账号创建

### 创建第一个项目

#### 方式一：手动创建

1. 点击"创建项目"按钮
2. 在编辑器中点击"新建任务"
3. 填写任务信息：
   - 任务名称
   - 开始日期
   - 结束日期
   - 负责人
   - 所属阶段
4. 点击"保存"

#### 方式二：AI 文件解析（推荐）

1. 点击"上传文件"按钮
2. 点击"AI 设置"配置你的 API Key：
   - 选择提供商（推荐 OpenRouter）
   - 输入 API Key
   - 选择模型（推荐 Claude Sonnet 4）
3. 拖拽或选择 Excel/Word/CSV 文件
4. 等待 AI 解析完成
5. 确认字段映射
6. 自动创建项目和任务

### 编辑甘特图

- **缩放**：使用工具栏的 +/- 按钮或滚轮
- **时间粒度**：切换日/周/月视图
- **编辑任务**：点击左侧任务列表中的任务
- **删除任务**：在任务编辑对话框中点击删除
- **自动保存**：编辑后 30 秒自动保存

### 分享项目

1. 点击右上角的"分享"按钮
2. 设置权限（仅查看/可评论/可编辑）
3. 设置过期时间（可选）
4. 复制分享链接
5. 发送给团队成员

### 导出项目

1. 点击"导出"按钮
2. 选择导出格式：
   - **PNG**：高清图片，适合演示
   - **CSV**：表格数据，适合 Excel
   - **JSON**：完整数据，适合备份
3. 点击"下载"

## 常用功能

### 项目管理

- **创建项目**：首页点击"创建项目"
- **打开项目**：首页项目列表点击项目卡片
- **删除项目**：项目卡片右下角删除按钮
- **重命名项目**：编辑器中点击项目名称旁的编辑图标

### 任务管理

- **新建任务**：编辑器左侧点击"新建任务"
- **编辑任务**：点击任务列表中的任务
- **删除任务**：任务编辑对话框中点击删除
- **任务排序**：拖拽任务列表中的任务（即将推出）

### 甘特图操作

- **缩放**：工具栏 +/- 按钮
- **时间粒度**：日/周/月切换
- **跳转今天**：点击"今天"按钮
- **显示周末**：切换周末显示开关
- **显示节假日**：切换节假日显示开关

## 配置 AI 解析

### 获取 API Key

#### OpenRouter（推荐）

1. 访问 [https://openrouter.ai/](https://openrouter.ai/)
2. 注册并登录
3. 访问 [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. 点击"Create Key"创建新的 API Key
5. 复制 API Key（格式：`sk-or-v1-...`）

#### Anthropic 官方

1. 访问 [https://www.anthropic.com/](https://www.anthropic.com/)
2. 注册并登录
3. 访问 [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
4. 点击"Create Key"创建新的 API Key
5. 复制 API Key（格式：`sk-ant-api03-...`）

### 配置步骤

1. 在应用中点击"上传文件"
2. 点击"AI 设置"
3. 选择 API 提供商
4. 粘贴 API Key
5. 选择模型
6. 点击"保存设置"

详细配置指南：[docs/OPENROUTER-SETUP.md](docs/OPENROUTER-SETUP.md)

## 故障排查

### 后端无法启动

**问题**：端口 3000 已被占用

**解决**：
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### 前端无法启动

**问题**：端口 5173 已被占用

**解决**：
```bash
# 修改 vite.config.ts 中的端口
server: {
  port: 5174  // 改为其他端口
}
```

### 数据库连接失败

**问题**：无法连接到 PostgreSQL

**解决**：
```bash
# 检查 Docker 服务状态
docker compose ps

# 重启数据库服务
docker compose restart postgres

# 查看日志
docker compose logs postgres
```

### AI 解析失败

**问题**：API Key 无效或余额不足

**解决**：
1. 检查 API Key 是否正确
2. 访问提供商控制台检查余额
3. 尝试重新生成 API Key
4. 切换到其他提供商

## 开发模式

### 热重载

前端和后端都支持热重载，修改代码后会自动刷新。

### 调试

#### 前端调试

使用浏览器开发者工具（F12）：
- Console：查看日志
- Network：查看 API 请求
- React DevTools：查看组件状态

#### 后端调试

查看终端日志：
```bash
cd backend
npm run dev
```

### 数据库管理

使用 pgAdmin 或其他 PostgreSQL 客户端连接：

```
Host: localhost
Port: 5432
Database: ganttxa
Username: postgres
Password: password
```

## 生产部署

详细部署指南请参考：[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)（即将推出）

## 获取帮助

- **文档**：[docs/](docs/)
- **问题反馈**：[GitHub Issues](https://github.com/fukkix/gattxa/issues)
- **开发计划**：[GanttXa_开发计划.md](GanttXa_开发计划.md)

## 下一步

- 📖 阅读 [API 文档](docs/API.md)
- 🎨 查看 [设计指南](docs/DESIGN-GUIDE.md)
- 🤖 配置 [AI 解析](docs/OPENROUTER-SETUP.md)
- 🚀 了解 [开发计划](GanttXa_开发计划.md)

---

**祝你使用愉快！** 🎉

如有问题，欢迎提交 [Issue](https://github.com/fukkix/gattxa/issues)。
