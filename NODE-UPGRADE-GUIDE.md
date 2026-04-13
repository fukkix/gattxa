# Node.js 升级指南

**日期**: 2026-04-13  
**系统**: macOS

---

## ✅ 已完成的升级

### 升级前
- Node.js: v12.17.0
- npm: 8.3.0

### 升级后
- Node.js: v18.20.8 ✅
- npm: 10.8.2 ✅

---

## 📝 使用的命令

### 1. 安装 nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 2. 加载 nvm
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### 3. 安装 Node.js 18
```bash
nvm install 18
```

### 4. 设置默认版本
```bash
nvm alias default 18
```

### 5. 验证版本
```bash
node --version  # v18.20.8
npm --version   # 10.8.2
```

---

## 🔧 常用 nvm 命令

### 查看已安装的版本
```bash
nvm list
```

### 查看可用的版本
```bash
nvm list-remote
```

### 切换版本
```bash
nvm use 18
nvm use 20
```

### 安装最新 LTS 版本
```bash
nvm install --lts
```

### 安装特定版本
```bash
nvm install 20.10.0
```

### 卸载版本
```bash
nvm uninstall 12.17.0
```

---

## 🚀 启动项目

### 后端
```bash
cd gattxa/backend
npm run dev
```

**预期输出**:
```
✅ WebSocket 服务已初始化
🚀 Server running on http://localhost:3000
📝 Environment: undefined
📁 Upload directory: ./uploads
🔌 WebSocket ready
```

### 前端
```bash
cd gattxa/frontend
npm run dev
```

---

## 💡 提示

### 永久加载 nvm

nvm 已经自动添加到你的 `~/.zshrc` 文件中。

如果需要手动添加，在 `~/.zshrc` 或 `~/.bash_profile` 中添加：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### 在新终端中使用

每次打开新终端时，nvm 会自动加载。

如果没有自动加载，运行：
```bash
source ~/.zshrc
```

---

## 🔍 故障排除

### 问题：nvm 命令未找到

**解决方法**:
```bash
source ~/.zshrc
# 或
source ~/.bash_profile
```

### 问题：npm 权限错误

**解决方法**:
```bash
# 使用 nvm 安装的 Node.js 不需要 sudo
npm install -g <package>
```

### 问题：旧版本 Node.js 仍在使用

**解决方法**:
```bash
nvm use 18
nvm alias default 18
```

---

## 📊 项目依赖状态

### 后端
- ✅ 依赖已安装（355 packages）
- ⚠️ 9 个高危漏洞（可运行 `npm audit fix`）

### 前端
- 待安装

---

## 🎯 下一步

1. ✅ Node.js 已升级到 18.20.8
2. ✅ 后端依赖已安装
3. ✅ 后端服务已启动
4. ⏳ 安装前端依赖
5. ⏳ 启动前端服务
6. ⏳ 测试 WebSocket 功能

---

**文档版本**: 1.0  
**最后更新**: 2026-04-13
