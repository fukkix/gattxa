# GanttXa

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

在线甘特图协作工具 - 支持 AI 智能解析项目文件

> **重要更新**：AI 文件解析功能现在需要用户自行配置 API Key，确保数据隐私和安全。详见 [AI 配置指南](docs/OPENROUTER-SETUP.md)。

## ✨ 项目简介

GanttXa 是一款面向项目管理者和团队协作者的在线甘特图生成与分享工具。通过 AI 技术降低项目可视化门槛，让项目管理更简单高效。

### 核心特性

- 📝 **双轨输入**：手动填写 + AI 文件解析（Excel/Word）
- 🤖 **AI 智能解析**：自动识别任务、日期、负责人等字段
- 🎨 **可视化编辑**：所见即所得的甘特图编辑器
- 🔗 **一键分享**：生成专属链接，无需注册即可查看
- 🤝 **实时协作**：多人同时编辑，实时同步
- 📤 **多格式导出**：PNG / PDF / Excel
- ⚡ **零门槛上手**：30 秒内生成专业甘特图

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Zustand（状态管理）
- TailwindCSS（样式）
- Canvas/SVG（甘特图渲染）
- Day.js（日期处理）

### 后端
- Node.js + Express + TypeScript
- PostgreSQL（数据库）
- Redis（缓存）
- Socket.io（实时协作）
- Claude API（AI 文件解析）

### DevOps
- Docker + Docker Compose
- GitHub Actions（CI/CD）
- Kubernetes（生产部署）

## 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### AI 配置（可选）

如果需要使用 AI 文件解析功能，您需要：

1. 获取 API Key（选择其一）：
   - [OpenRouter](https://openrouter.ai/keys)（推荐，价格更优惠）
   - [Anthropic 官方](https://console.anthropic.com/settings/keys)

2. 在应用中配置：
   - 点击"上传文件"按钮
   - 点击"AI 设置"
   - 输入您的 API Key 和选择模型
   - API Key 仅存储在浏览器本地，不会上传到服务器

详细配置指南：[docs/OPENROUTER-SETUP.md](docs/OPENROUTER-SETUP.md)

### 开发环境启动

```bash
# 克隆仓库
git clone https://github.com/fukkix/gattxa.git
cd gattxa

# 使用 Docker Compose 一键启动
docker-compose up -d

# 前端开发服务器
cd frontend
npm install
npm run dev

# 后端开发服务器
cd backend
npm install
npm run dev
```

访问 http://localhost:5173 查看应用

## 项目结构

```
ganttxa/
├── frontend/           # 前端项目
├── backend/            # 后端项目
├── docs/               # 文档
├── docker-compose.yml  # Docker 编排
└── README.md
```

## 开发文档

- [快速开始](QUICKSTART.md)
- [功能说明](docs/FEATURES.md)
- [环境搭建指南](docs/SETUP.md)
- [API 文档](docs/API.md)
- [设计指南](docs/DESIGN-GUIDE.md)
- [AI 配置指南](docs/OPENROUTER-SETUP.md)
- [开发进度](DEVELOPMENT-PROGRESS.md)

## 开发计划

查看 [GanttXa_开发计划.md](GanttXa_开发计划.md) 了解详细的开发路线图。

## 📅 开发路线图

| 里程碑 | 时间 | 状态 | 主要功能 |
|--------|------|------|----------|
| M0 | 第 1-2 周 | ✅ 已完成 | 项目初始化、基础架构 |
| M1 | 第 3-6 周 | ✅ 已完成 | MVP 核心功能、手动填写、甘特图渲染 |
| M2 | 第 7-10 周 | ✅ 已完成 | AI 文件解析、字段识别 |
| M3 | 第 11-14 周 | 🚧 进行中 | 评论系统、PDF 导出、性能测试 |
| M4 | 第 15-18 周 | ⏳ 计划中 | 实时协作、冲突处理 |

查看 [完整开发计划](GanttXa_开发计划.md)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 团队

由 AI Agent 团队协作开发：
- 🤖 AI 集成专家 - Claude API 集成与文件解析
- 💻 前端工程师 - React + TypeScript 应用开发
- 🔧 后端工程师 - Node.js API 与数据库设计
- 🚀 DevOps 工程师 - 容器化与 CI/CD

## 📞 联系方式

- GitHub Issues: [提交问题](https://github.com/fukkix/gattxa/issues)
- 项目主页: [https://github.com/fukkix/gattxa](https://github.com/fukkix/gattxa)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
