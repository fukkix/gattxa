# M3 权限管理功能更新文档

**更新日期**: 2026-04-13  
**版本**: 1.3.0  
**功能**: 项目成员管理 + 权限控制

---

## 🎉 新增功能

### 1. 项目成员管理

完整的项目成员管理系统，支持邀请、角色分配和权限控制。

#### 功能特性

- ✅ 查看项目成员列表
- ✅ 邀请新成员加入项目
- ✅ 管理成员角色和权限
- ✅ 移除项目成员
- ✅ 转让项目所有权
- ✅ 离开项目

#### 角色系统

**所有者 (Owner)**:
- 拥有所有权限
- 可以转让所有权
- 不能被移除
- 每个项目只有一个所有者

**管理员 (Admin)**:
- 可以管理项目和成员
- 可以邀请和移除成员
- 可以编辑项目内容
- 可以评论

**成员 (Member)**:
- 可以编辑项目内容
- 可以评论
- 可以查看项目
- 不能管理成员

**查看者 (Viewer)**:
- 只能查看项目
- 不能编辑或评论
- 不能管理成员

#### 权限系统

每个角色都有对应的权限：

```typescript
{
  view: boolean,     // 查看项目
  comment: boolean,  // 添加评论
  edit: boolean,     // 编辑项目
  manage: boolean    // 管理成员
}
```

**默认权限**:
- 所有者: `{view: true, comment: true, edit: true, manage: true}`
- 管理员: `{view: true, comment: true, edit: true, manage: true}`
- 成员: `{view: true, comment: true, edit: true, manage: false}`
- 查看者: `{view: true, comment: false, edit: false, manage: false}`

---

### 2. 项目邀请系统

通过邮箱邀请用户加入项目。

#### 功能特性

- ✅ 发送邀请邮箱
- ✅ 设置邀请角色
- ✅ 邀请过期时间（7天）
- ✅ 查看待处理邀请
- ✅ 撤销邀请
- ✅ 接受邀请

#### 邀请流程

1. **发送邀请**:
   - 管理员或所有者输入邮箱地址
   - 选择角色（管理员/成员/查看者）
   - 系统生成唯一邀请链接
   - 发送邀请（TODO: 邮件通知）

2. **接受邀请**:
   - 用户收到邀请链接
   - 点击链接打开邀请页面
   - 登录或注册账号
   - 接受邀请加入项目

3. **邀请状态**:
   - `pending` - 待接受
   - `accepted` - 已接受
   - `expired` - 已过期
   - `revoked` - 已撤销

---

### 3. 权限控制中间件

后端权限检查中间件，确保 API 安全。

#### 中间件类型

**checkProjectPermission(permission)**:
- 检查用户是否有特定权限
- 用法: `checkProjectPermission('edit')`

**checkProjectMember**:
- 检查用户是否是项目成员
- 用于需要成员身份的操作

**checkProjectOwner**:
- 检查用户是否是项目所有者
- 用于敏感操作（如转让所有权）

#### 使用示例

```typescript
// 需要编辑权限
router.put('/projects/:id', 
  authenticate, 
  checkProjectPermission('edit'), 
  updateProject
)

// 需要管理权限
router.post('/projects/:id/members', 
  authenticate, 
  checkProjectPermission('manage'), 
  inviteMember
)

// 需要所有者权限
router.post('/projects/:id/transfer', 
  authenticate, 
  checkProjectOwner, 
  transferOwnership
)
```

---

## 📦 新增文件

### 后端文件（2 个）
```
backend/src/routes/members.ts              项目成员管理路由
backend/src/middleware/permissions.ts      权限检查中间件
```

### 前端文件（1 个）
```
frontend/src/components/ProjectMembersDialog.tsx  项目成员管理对话框
```

### 数据库文件（1 个）
```
database/migrations/003_add_project_members_table.sql  成员和邀请表迁移
```

### 脚本文件（2 个）
```
scripts/migrate-m3-permissions.sh          迁移脚本（Linux/Mac）
scripts/migrate-m3-permissions.ps1         迁移脚本（Windows）
```

---

## 🔧 修改的文件

### 后端文件（1 个）
```
backend/src/index.ts                       添加成员路由
```

### 前端文件（1 个）
```
frontend/src/pages/EditorPage.tsx          添加成员管理按钮
```

---

## 🗄️ 数据库变更

### 新增表

**project_members 表**:
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '...',
  invited_by UUID,
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(project_id, user_id)
);
```

**project_invitations 表**:
```sql
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '...',
  token VARCHAR(64) UNIQUE NOT NULL,
  invited_by UUID NOT NULL,
  invited_at TIMESTAMP,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);
```

### 新增索引
- `idx_project_members_project_id` - 项目 ID 索引
- `idx_project_members_user_id` - 用户 ID 索引
- `idx_project_members_role` - 角色索引
- `idx_project_members_status` - 状态索引
- `idx_project_invitations_project_id` - 项目 ID 索引
- `idx_project_invitations_email` - 邮箱索引
- `idx_project_invitations_token` - Token 索引
- `idx_project_invitations_status` - 状态索引

### 数据迁移
- 为所有现有项目自动添加所有者成员记录

---

## 🎯 API 文档

### 获取项目成员

```http
GET /api/projects/:projectId/members
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "id": "member_id",
    "user_id": "user_id",
    "user_name": "张三",
    "user_email": "zhangsan@example.com",
    "role": "owner",
    "permissions": {
      "view": true,
      "comment": true,
      "edit": true,
      "manage": true
    },
    "joined_at": "2026-04-01T10:00:00Z",
    "invited_by_name": null
  }
]
```

### 邀请成员

```http
POST /api/projects/:projectId/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "member"
}
```

**响应**:
```json
{
  "id": "invitation_id",
  "project_id": "project_id",
  "email": "user@example.com",
  "role": "member",
  "token": "invitation_token",
  "invited_by": "user_id",
  "invited_at": "2026-04-13T10:00:00Z",
  "expires_at": "2026-04-20T10:00:00Z",
  "status": "pending",
  "invitation_url": "http://localhost:5173/invitation/invitation_token"
}
```

### 获取项目邀请列表

```http
GET /api/projects/:projectId/invitations
Authorization: Bearer <token>
```

### 接受邀请

```http
POST /api/invitations/:token/accept
Authorization: Bearer <token>
```

### 撤销邀请

```http
DELETE /api/invitations/:id
Authorization: Bearer <token>
```

### 更新成员角色

```http
PUT /api/projects/:projectId/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin",
  "permissions": {
    "view": true,
    "comment": true,
    "edit": true,
    "manage": true
  }
}
```

### 移除成员

```http
DELETE /api/projects/:projectId/members/:memberId
Authorization: Bearer <token>
```

### 离开项目

```http
POST /api/projects/:projectId/leave
Authorization: Bearer <token>
```

### 转让所有权

```http
POST /api/projects/:projectId/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "newOwnerId": "user_id"
}
```

---

## 🚀 部署步骤

### 1. 更新数据库

**Linux/Mac**:
```bash
chmod +x scripts/migrate-m3-permissions.sh
./scripts/migrate-m3-permissions.sh
```

**Windows**:
```powershell
.\scripts\migrate-m3-permissions.ps1
```

### 2. 重启服务

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

### 查看项目成员

1. 打开项目编辑器
2. 点击顶部工具栏的"成员"按钮（👥 图标）
3. 查看所有项目成员
4. 查看成员角色和加入时间

### 邀请新成员

1. 打开项目成员对话框
2. 点击"邀请成员"按钮
3. 输入邮箱地址
4. 选择角色（管理员/成员/查看者）
5. 点击"发送邀请"
6. 复制邀请链接发送给对方

### 管理成员

1. 打开项目成员对话框
2. 找到要管理的成员
3. 点击"移除"按钮移除成员
4. 或点击成员查看详情（TODO）

### 管理邀请

1. 打开项目成员对话框
2. 切换到"邀请"标签页
3. 查看所有待处理的邀请
4. 点击"撤销"按钮撤销邀请

### 接受邀请

1. 收到邀请链接
2. 点击链接打开邀请页面
3. 登录或注册账号
4. 点击"接受邀请"按钮
5. 自动加入项目

---

## ⚠️ 已知问题

### 高优先级
- 无

### 中优先级
1. 邀请邮件通知未实现
2. 邀请页面未实现
3. 成员角色编辑功能未实现
4. 权限自定义功能未实现

### 低优先级
1. 成员活动日志未实现
2. 成员统计未实现
3. 批量邀请未实现

---

## 🔜 后续计划

### 短期（1-2 周）
1. 实现邀请页面
2. 实现邮件通知
3. 成员角色编辑功能
4. 权限自定义功能

### 中期（3-4 周）
1. 成员活动日志
2. 成员统计
3. 批量邀请
4. 成员搜索和过滤

### 长期（M4 阶段）
1. 实时成员在线状态
2. 成员协作冲突检测
3. 成员操作历史
4. 成员权限审计

---

## 📊 代码统计

### 新增代码
- 后端代码：约 800 行
- 前端代码：约 400 行
- 数据库脚本：约 150 行
- 文档：约 800 行
- **总计**：约 2150 行

### 文件统计
- 新增文件：7 个
- 修改文件：2 个
- **总计**：9 个文件

---

## 🎓 最佳实践

### 角色分配

✅ **推荐做法**:
- 核心团队成员设为管理员
- 普通协作者设为成员
- 外部查看者设为查看者
- 谨慎转让所有权

❌ **不推荐做法**:
- 给所有人管理员权限
- 随意转让所有权
- 不设置权限直接分享

### 邀请管理

✅ **推荐做法**:
- 及时撤销过期邀请
- 定期检查待处理邀请
- 使用合适的角色邀请

❌ **不推荐做法**:
- 让邀请长期待处理
- 给错误的角色权限
- 不检查邀请状态

---

## 📞 联系方式

- GitHub: https://github.com/fukkix/gattxa
- Issues: https://github.com/fukkix/gattxa/issues
- Discussions: https://github.com/fukkix/gattxa/discussions

---

**开发团队**: GanttXa Development Team  
**完成日期**: 2026-04-13  
**版本**: 1.3.0 (M3 权限管理)  
**下一版本**: 1.4.0 (M3 完整版)

---

**感谢您的使用！** 🎉
