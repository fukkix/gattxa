# M4 阶段开发计划 - 实时协作

**阶段**: M4 - 实时协作功能  
**预计时间**: 4 周（第 15-18 周）  
**开始日期**: 2026-04-13  
**目标版本**: 2.0.0

---

## 📋 功能概述

M4 阶段将为 GanttXa 添加实时协作功能，使多个用户能够同时编辑同一个项目，并实时看到彼此的更改。

---

## 🎯 核心功能

### 1. WebSocket 实时同步 🔄

**功能描述**:
- 使用 WebSocket 建立实时双向通信
- 实时同步任务的增删改操作
- 实时同步评论的增删改操作
- 实时推送通知

**技术实现**:
- Socket.io（前后端）
- Redis Pub/Sub（多服务器支持）
- 房间管理（按项目 ID 分组）
- 事件系统（task:create, task:update, task:delete 等）

**优先级**: P0（核心功能）

---

### 2. 多人在线显示 👥

**功能描述**:
- 显示当前在线用户列表
- 显示用户头像和姓名
- 显示用户当前操作位置（光标、选中任务等）
- 用户进入/离开提示

**技术实现**:
- 在线用户状态管理
- 用户活动追踪
- 光标位置同步
- 心跳检测（30秒）

**优先级**: P1（重要功能）

---

### 3. 冲突检测和解决 ⚠️

**功能描述**:
- 检测并发编辑冲突
- 自动合并非冲突更改
- 提示用户手动解决冲突
- 冲突历史记录

**技术实现**:
- 版本号机制（Optimistic Locking）
- 操作时间戳
- 最后写入优胜策略
- 冲突提示 UI

**优先级**: P0（核心功能）

---

### 4. 操作历史记录 📜

**功能描述**:
- 记录所有操作历史
- 显示操作时间和用户
- 支持撤销/重做
- 操作回放（可选）

**技术实现**:
- 操作日志表
- 命令模式（Command Pattern）
- 撤销栈和重做栈
- 操作序列化

**优先级**: P1（重要功能）

---

## 🗓️ 开发计划

### 第 1 周：WebSocket 基础设施

**后端任务**:
- [ ] 安装和配置 Socket.io
- [ ] 创建 WebSocket 服务
- [ ] 实现房间管理
- [ ] 实现用户认证
- [ ] 配置 Redis Pub/Sub
- [ ] 实现基础事件系统

**前端任务**:
- [ ] 安装 Socket.io Client
- [ ] 创建 WebSocket 连接管理
- [ ] 实现自动重连机制
- [ ] 实现事件监听系统
- [ ] 创建连接状态显示

**测试**:
- [ ] 连接建立测试
- [ ] 断线重连测试
- [ ] 多客户端测试

---

### 第 2 周：实时同步功能

**后端任务**:
- [ ] 实现任务同步事件
  - task:create
  - task:update
  - task:delete
  - task:move
- [ ] 实现评论同步事件
  - comment:create
  - comment:update
  - comment:delete
- [ ] 实现通知推送
- [ ] 实现版本号机制

**前端任务**:
- [ ] 实现任务实时更新
- [ ] 实现评论实时更新
- [ ] 实现通知实时推送
- [ ] 实现乐观更新（Optimistic Update）
- [ ] 实现冲突检测 UI

**测试**:
- [ ] 双人并发编辑测试
- [ ] 多人并发编辑测试
- [ ] 网络延迟测试

---

### 第 3 周：在线用户和冲突处理

**后端任务**:
- [ ] 实现在线用户管理
- [ ] 实现用户活动追踪
- [ ] 实现心跳检测
- [ ] 实现冲突检测算法
- [ ] 实现冲突解决策略

**前端任务**:
- [ ] 创建在线用户列表组件
- [ ] 实现用户头像显示
- [ ] 实现用户活动指示器
- [ ] 创建冲突解决对话框
- [ ] 实现冲突提示和处理

**测试**:
- [ ] 在线用户显示测试
- [ ] 冲突检测测试
- [ ] 冲突解决测试

---

### 第 4 周：操作历史和优化

**后端任务**:
- [ ] 创建操作历史表
- [ ] 实现操作记录
- [ ] 实现操作查询
- [ ] 实现撤销/重做逻辑
- [ ] 性能优化

**前端任务**:
- [ ] 创建操作历史组件
- [ ] 实现撤销/重做按钮
- [ ] 实现操作历史列表
- [ ] 实现键盘快捷键（Ctrl+Z/Ctrl+Y）
- [ ] 性能优化

**测试**:
- [ ] 操作历史记录测试
- [ ] 撤销/重做测试
- [ ] 性能压力测试
- [ ] 端到端测试

---

## 🛠️ 技术栈

### 后端

**核心库**:
- Socket.io - WebSocket 服务
- Redis - Pub/Sub 和缓存
- ioredis - Redis 客户端

**新增依赖**:
```json
{
  "socket.io": "^4.6.0",
  "ioredis": "^5.3.0"
}
```

### 前端

**核心库**:
- Socket.io Client - WebSocket 客户端
- Zustand - 状态管理（已有）

**新增依赖**:
```json
{
  "socket.io-client": "^4.6.0"
}
```

---

## 📊 数据库设计

### 操作历史表

```sql
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  operation_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  is_undone BOOLEAN DEFAULT FALSE,
  INDEX idx_operation_logs_project_id (project_id),
  INDEX idx_operation_logs_user_id (user_id),
  INDEX idx_operation_logs_timestamp (timestamp DESC)
);
```

### 在线用户表（Redis）

```typescript
interface OnlineUser {
  userId: string
  userName: string
  userEmail: string
  projectId: string
  socketId: string
  joinedAt: number
  lastActivity: number
  currentTask?: string
}
```

---

## 🔄 WebSocket 事件设计

### 连接事件

```typescript
// 客户端 -> 服务器
'join:project' - 加入项目房间
'leave:project' - 离开项目房间
'heartbeat' - 心跳

// 服务器 -> 客户端
'user:joined' - 用户加入
'user:left' - 用户离开
'users:online' - 在线用户列表
```

### 任务事件

```typescript
// 客户端 -> 服务器
'task:create' - 创建任务
'task:update' - 更新任务
'task:delete' - 删除任务
'task:move' - 移动任务

// 服务器 -> 客户端
'task:created' - 任务已创建
'task:updated' - 任务已更新
'task:deleted' - 任务已删除
'task:moved' - 任务已移动
'task:conflict' - 任务冲突
```

### 评论事件

```typescript
// 客户端 -> 服务器
'comment:create' - 创建评论
'comment:update' - 更新评论
'comment:delete' - 删除评论

// 服务器 -> 客户端
'comment:created' - 评论已创建
'comment:updated' - 评论已更新
'comment:deleted' - 评论已删除
```

### 通知事件

```typescript
// 服务器 -> 客户端
'notification:new' - 新通知
'notification:read' - 通知已读
```

---

## ⚡ 性能目标

### 实时同步性能

| 指标 | 目标 | 说明 |
|------|------|------|
| 消息延迟 | ≤ 300ms | 从操作到其他用户看到 |
| 连接建立 | ≤ 1s | WebSocket 连接建立时间 |
| 重连时间 | ≤ 2s | 断线后重新连接时间 |
| 并发用户 | ≥ 100 | 单项目支持的并发用户数 |
| 消息吞吐 | ≥ 1000/s | 每秒处理的消息数 |

### 冲突处理性能

| 指标 | 目标 | 说明 |
|------|------|------|
| 冲突检测 | ≤ 100ms | 检测冲突的时间 |
| 冲突解决 | ≤ 500ms | 自动解决冲突的时间 |
| 冲突率 | ≤ 5% | 并发编辑时的冲突率 |

---

## 🎯 验收标准

### 功能验收

- [ ] 双人可以同时编辑项目
- [ ] 一方的更改实时显示在另一方
- [ ] 显示在线用户列表
- [ ] 冲突能被正确检测和提示
- [ ] 操作历史能正确记录
- [ ] 撤销/重做功能正常工作

### 性能验收

- [ ] 消息延迟 ≤ 300ms
- [ ] 支持 10 人同时在线编辑
- [ ] 断线重连正常工作
- [ ] 无明显卡顿

### 稳定性验收

- [ ] 长时间运行无内存泄漏
- [ ] 网络波动时能正常工作
- [ ] 服务器重启后能自动重连
- [ ] 数据不丢失

---

## 🔒 安全考虑

### WebSocket 安全

- [ ] JWT Token 认证
- [ ] 房间权限验证
- [ ] 消息内容验证
- [ ] 频率限制（Rate Limiting）

### 数据安全

- [ ] 操作权限检查
- [ ] 敏感数据过滤
- [ ] SQL 注入防护
- [ ] XSS 防护

---

## 📝 文档计划

### 技术文档

- [ ] WebSocket API 文档
- [ ] 事件系统文档
- [ ] 冲突处理文档
- [ ] 部署指南

### 用户文档

- [ ] 实时协作使用指南
- [ ] 冲突解决指南
- [ ] 操作历史使用指南
- [ ] 常见问题解答

---

## 🚀 部署计划

### 开发环境

- [ ] 配置 Redis
- [ ] 配置 Socket.io
- [ ] 更新环境变量

### 生产环境

- [ ] Redis 集群配置
- [ ] Socket.io 集群配置
- [ ] 负载均衡配置
- [ ] 监控和日志

---

## 🎓 技术挑战

### 1. 并发控制

**挑战**: 多用户同时编辑同一任务
**解决方案**: 
- 乐观锁（版本号）
- 最后写入优胜
- 冲突提示

### 2. 网络延迟

**挑战**: 网络延迟导致的不一致
**解决方案**:
- 乐观更新
- 操作队列
- 重试机制

### 3. 状态同步

**挑战**: 保持所有客户端状态一致
**解决方案**:
- 事件驱动架构
- 状态快照
- 增量更新

### 4. 扩展性

**挑战**: 支持大量并发用户
**解决方案**:
- Redis Pub/Sub
- 水平扩展
- 负载均衡

---

## 📈 里程碑

### 里程碑 1：WebSocket 基础（第 1 周末）
- ✅ WebSocket 连接建立
- ✅ 房间管理
- ✅ 基础事件系统

### 里程碑 2：实时同步（第 2 周末）
- ✅ 任务实时同步
- ✅ 评论实时同步
- ✅ 通知实时推送

### 里程碑 3：协作功能（第 3 周末）
- ✅ 在线用户显示
- ✅ 冲突检测和处理
- ✅ 用户活动追踪

### 里程碑 4：完整功能（第 4 周末）
- ✅ 操作历史
- ✅ 撤销/重做
- ✅ 性能优化
- ✅ 完整测试

---

## 🔜 后续优化

### 短期优化
- 操作回放功能
- 更智能的冲突解决
- 离线编辑支持

### 长期优化
- CRDT 算法
- 端到端加密
- 语音/视频通话

---

**开发团队**: GanttXa Development Team  
**计划日期**: 2026-04-13  
**目标版本**: 2.0.0 (M4 实时协作)

---

**让我们开始 M4 的开发之旅！** 🚀
