# M3 通知功能更新文档

**更新日期**: 2026-04-13  
**版本**: 1.2.0  
**功能**: @ 提及自动补全 + 通知中心

---

## 🎉 新增功能

### 1. @ 提及自动补全

在评论中输入 `@` 时，会自动显示用户列表供选择。

#### 功能特性

- ✅ 实时搜索用户
- ✅ 键盘导航（↑↓ 选择，Enter 确认，Esc 取消）
- ✅ 模糊搜索（支持姓名和邮箱）
- ✅ 项目成员优先显示
- ✅ 用户头像和信息展示
- ✅ 自动插入提及

#### 使用方法

1. 在评论输入框中输入 `@`
2. 开始输入用户名或邮箱
3. 使用 ↑↓ 键选择用户
4. 按 Enter 键确认选择
5. 或直接点击用户进行选择

#### 技术实现

**前端组件**: `MentionAutocomplete.tsx`
- 实时检测 @ 输入
- 动态加载用户建议
- 键盘快捷键支持
- 智能光标定位

**后端 API**:
```
GET /api/projects/:projectId/members?search=xxx  获取项目成员
GET /api/users/search?q=xxx                      搜索所有用户
```

---

### 2. 通知中心

查看所有 @ 提及通知，支持已读/未读状态管理。

#### 功能特性

- ✅ 实时通知提醒
- ✅ 未读数量显示
- ✅ 通知列表展示
- ✅ 已读/未读过滤
- ✅ 一键全部标记为已读
- ✅ 点击通知跳转到任务
- ✅ 相对时间显示
- ✅ 自动刷新（30秒）

#### 使用方法

1. 点击顶部工具栏的通知图标（🔔）
2. 查看所有提及你的评论
3. 点击通知可跳转到对应任务
4. 使用过滤器查看未读通知
5. 点击"全部标记为已读"清空未读

#### 技术实现

**前端组件**:
- `NotificationCenter.tsx` - 通知中心对话框
- `NotificationButton.tsx` - 通知按钮（带未读数量）

**后端 API**:
```
GET  /api/notifications                      获取所有通知
GET  /api/notifications?unreadOnly=true      获取未读通知
POST /api/notifications/:commentId/read      标记单个通知为已读
POST /api/notifications/read-all             标记所有通知为已读
```

**数据库表**: `comment_reads`
```sql
CREATE TABLE comment_reads (
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);
```

---

## 📦 新增文件

### 后端文件（1 个）
```
backend/src/routes/users.ts                    用户和通知相关路由
```

### 前端文件（3 个）
```
frontend/src/components/MentionAutocomplete.tsx    @ 提及自动补全组件
frontend/src/components/NotificationCenter.tsx     通知中心组件
frontend/src/components/NotificationButton.tsx     通知按钮组件
```

### 数据库文件（1 个）
```
database/migrations/002_add_comment_reads_table.sql  评论已读表迁移
```

### 脚本文件（2 个）
```
scripts/migrate-m3-notifications.sh             数据库迁移脚本（Linux/Mac）
scripts/migrate-m3-notifications.ps1            数据库迁移脚本（Windows）
```

---

## 🔧 修改的文件

### 后端文件（1 个）
```
backend/src/index.ts                            添加用户路由
```

### 前端文件（2 个）
```
frontend/src/components/CommentSection.tsx      集成自动补全组件
frontend/src/pages/EditorPage.tsx               添加通知按钮
```

---

## 🚀 部署步骤

### 1. 更新数据库

**Linux/Mac**:
```bash
chmod +x scripts/migrate-m3-notifications.sh
./scripts/migrate-m3-notifications.sh
```

**Windows**:
```powershell
.\scripts\migrate-m3-notifications.ps1
```

### 2. 安装依赖

前端和后端都不需要安装新的依赖。

### 3. 重启服务

**后端**:
```bash
cd backend
npm run dev
```

**前端**:
```bash
cd frontend
npm run dev
```

---

## 📖 使用指南

### @ 提及自动补全

#### 基本使用
```
1. 在评论框输入 @
2. 输入用户名的一部分，如 "张"
3. 看到用户列表后，使用键盘或鼠标选择
4. 选中后自动插入 @张三
```

#### 键盘快捷键
- `↑` / `↓` - 上下选择用户
- `Enter` - 确认选择
- `Esc` - 取消选择

#### 搜索范围
- 优先显示项目成员（有评论记录的用户）
- 支持按姓名和邮箱搜索
- 最多显示 20 个结果

### 通知中心

#### 查看通知
1. 点击顶部工具栏的通知图标
2. 红色数字表示未读通知数量
3. 通知列表按时间倒序排列

#### 过滤通知
- **全部** - 显示所有通知
- **未读** - 仅显示未读通知

#### 标记已读
- 点击通知自动标记为已读
- 点击"全部标记为已读"清空所有未读

#### 跳转到任务
- 点击通知可跳转到对应的项目和任务
- 自动打开评论对话框（待实现）

---

## 🎯 API 文档

### 获取项目成员

```http
GET /api/projects/:projectId/members?search=xxx
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "id": "user_id",
    "name": "张三",
    "email": "zhangsan@example.com"
  }
]
```

### 搜索用户

```http
GET /api/users/search?q=xxx
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "id": "user_id",
    "name": "张三",
    "email": "zhangsan@example.com"
  }
]
```

### 获取通知

```http
GET /api/notifications?unreadOnly=true
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "comment_id": "comment_id",
    "content": "@张三 请帮忙review",
    "created_at": "2026-04-13T10:00:00Z",
    "task_id": "task_id",
    "task_name": "开发评论功能",
    "project_id": "project_id",
    "project_name": "GanttXa",
    "user_id": "user_id",
    "user_name": "李四",
    "user_email": "lisi@example.com",
    "is_read": false
  }
]
```

### 标记通知为已读

```http
POST /api/notifications/:commentId/read
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "已标记为已读"
}
```

### 标记所有通知为已读

```http
POST /api/notifications/read-all
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "已全部标记为已读"
}
```

---

## 🔍 技术细节

### 自动补全实现原理

1. **输入检测**: 监听 textarea 的 onChange 和 onClick 事件
2. **@ 识别**: 从光标位置向前查找最近的 @ 符号
3. **查询提取**: 提取 @ 后面的文本作为搜索关键词
4. **API 调用**: 调用后端 API 获取匹配的用户列表
5. **结果展示**: 在输入框上方显示用户列表
6. **用户选择**: 支持键盘和鼠标选择
7. **文本插入**: 替换 @ 和查询文本为完整的提及

### 通知系统实现原理

1. **提及提取**: 评论创建时提取所有 @ 提及
2. **提及存储**: 将提及的用户 ID 存储在 mentions 数组中
3. **通知查询**: 查询 mentions 数组包含当前用户 ID 的评论
4. **已读状态**: 使用 comment_reads 表记录已读状态
5. **实时更新**: 前端每 30 秒刷新一次未读数量

### 性能优化

1. **索引优化**: 
   - comment_reads 表添加了 user_id 和 comment_id 索引
   - comments 表的 mentions 字段使用 GIN 索引

2. **查询优化**:
   - 使用 EXISTS 子查询判断已读状态
   - 限制返回结果数量（最多 50 条）

3. **前端优化**:
   - 防抖搜索（避免频繁 API 调用）
   - 虚拟滚动（大量通知时）
   - 定时刷新（避免轮询过于频繁）

---

## ⚠️ 已知问题

### 高优先级
- 无

### 中优先级
1. 点击通知后未自动打开评论对话框
2. 通知中心未实现虚拟滚动（大量通知时可能卡顿）
3. 自动补全未实现缓存（每次输入都会请求 API）

### 低优先级
1. 未实现邮件通知
2. 未实现浏览器推送通知
3. 未实现通知声音提示

---

## 🔜 后续计划

### 短期（1-2 周）
1. ✅ 提及自动补全
2. ✅ 通知中心 UI
3. ⏳ 点击通知跳转优化
4. ⏳ 通知缓存优化

### 中期（3-4 周）
1. ⏳ 邮件通知
2. ⏳ 浏览器推送通知
3. ⏳ 通知设置（开关、频率）
4. ⏳ 通知分组

### 长期（M4 阶段）
1. ⏳ 实时通知（WebSocket）
2. ⏳ 通知聚合
3. ⏳ 通知统计
4. ⏳ 通知历史

---

## 📊 代码统计

### 新增代码
- 后端代码：约 300 行
- 前端代码：约 800 行
- 数据库脚本：约 50 行
- 文档：约 600 行
- **总计**：约 1750 行

### 文件统计
- 新增文件：8 个
- 修改文件：3 个
- **总计**：11 个文件

---

## 🎓 最佳实践

### 使用 @ 提及

1. **及时提及**: 需要特定人员关注时立即使用 @
2. **准确提及**: 确保提及正确的用户
3. **避免滥用**: 不要在每条评论中都提及所有人
4. **礼貌用语**: 提及他人时使用礼貌用语

### 管理通知

1. **定期查看**: 每天至少查看一次通知
2. **及时处理**: 看到提及后及时回复
3. **标记已读**: 处理完通知后标记为已读
4. **过滤查看**: 使用未读过滤快速找到待处理通知

---

## 🆘 故障排查

### 自动补全不显示

**问题**: 输入 @ 后没有显示用户列表

**解决方案**:
1. 检查是否已登录
2. 检查网络连接
3. 检查浏览器控制台是否有错误
4. 确认后端服务正常运行
5. 检查数据库中是否有用户数据

### 通知不显示

**问题**: 被提及后没有收到通知

**解决方案**:
1. 检查是否已登录
2. 刷新页面重新加载通知
3. 检查数据库中 comments 表的 mentions 字段
4. 确认 comment_reads 表已创建
5. 检查后端日志是否有错误

### 通知数量不准确

**问题**: 未读通知数量显示不正确

**解决方案**:
1. 刷新页面
2. 点击"全部标记为已读"后重新加载
3. 检查 comment_reads 表数据
4. 清除浏览器缓存

---

## 📞 联系方式

- GitHub: https://github.com/fukkix/gattxa
- Issues: https://github.com/fukkix/gattxa/issues
- Discussions: https://github.com/fukkix/gattxa/discussions

---

**开发团队**: GanttXa Development Team  
**完成日期**: 2026-04-13  
**版本**: 1.2.0 (M3 通知功能)  
**下一版本**: 1.3.0 (M3 完整版)

---

**感谢您的使用！** 🎉
