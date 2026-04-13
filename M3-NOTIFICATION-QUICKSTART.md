# M3 通知功能快速开始指南

**版本**: 1.2.0  
**更新日期**: 2026-04-13

---

## 🚀 快速开始

### 1. 更新数据库

运行迁移脚本添加 `comment_reads` 表：

**Linux/Mac**:
```bash
cd gattxa
chmod +x scripts/migrate-m3-notifications.sh
./scripts/migrate-m3-notifications.sh
```

**Windows PowerShell**:
```powershell
cd gattxa
.\scripts\migrate-m3-notifications.ps1
```

### 2. 重启服务

**后端**:
```bash
cd backend
npm run dev
```

**前端**（新终端）:
```bash
cd frontend
npm run dev
```

---

## 💡 功能演示

### @ 提及自动补全

1. 登录到 GanttXa
2. 打开一个项目
3. 点击任务的"评论"按钮
4. 在评论框中输入 `@`
5. 开始输入用户名，如 `@张`
6. 看到用户列表后：
   - 使用 ↑↓ 键选择用户
   - 按 Enter 确认
   - 或直接点击用户
7. 用户名自动插入到评论中

**键盘快捷键**:
- `↑` / `↓` - 上下选择
- `Enter` - 确认选择
- `Esc` - 取消

### 通知中心

1. 当有人在评论中 @ 你时
2. 顶部工具栏的通知图标会显示红色数字
3. 点击通知图标打开通知中心
4. 查看所有提及你的评论
5. 点击通知可跳转到对应任务
6. 使用过滤器查看未读通知
7. 点击"全部标记为已读"清空未读

---

## 🎯 使用场景

### 场景 1: 任务协作

```
张三创建了一个任务"开发登录功能"
张三在评论中写道：@李四 请帮忙review这个功能
李四收到通知，点击查看评论
李四回复：@张三 已经review完成，有几个建议
张三收到通知，查看李四的建议
```

### 场景 2: 问题讨论

```
产品经理在任务中评论：@开发团队 这个需求需要调整
所有开发团队成员收到通知
团队成员逐一回复讨论
通过 @ 提及特定人员获取反馈
```

### 场景 3: 进度跟进

```
项目经理在任务中评论：@张三 这个任务进度如何？
张三收到通知，及时回复进度
项目经理标记通知为已读
继续跟进其他任务
```

---

## 📊 API 测试

### 测试自动补全

```bash
# 获取项目成员
curl -X GET "http://localhost:3000/api/projects/PROJECT_ID/members?search=张" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 搜索用户
curl -X GET "http://localhost:3000/api/users/search?q=张" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 测试通知

```bash
# 获取所有通知
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取未读通知
curl -X GET "http://localhost:3000/api/notifications?unreadOnly=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 标记通知为已读
curl -X POST "http://localhost:3000/api/notifications/COMMENT_ID/read" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 标记所有通知为已读
curl -X POST "http://localhost:3000/api/notifications/read-all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 故障排查

### 问题 1: 自动补全不显示

**症状**: 输入 @ 后没有显示用户列表

**检查步骤**:
1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有错误
3. 查看 Network 标签，确认 API 请求是否成功
4. 检查后端服务是否运行
5. 确认数据库中有用户数据

**解决方案**:
```bash
# 检查后端服务
cd backend
npm run dev

# 检查数据库连接
psql -U postgres -d ganttxa -c "SELECT COUNT(*) FROM users;"
```

### 问题 2: 通知不显示

**症状**: 被提及后没有收到通知

**检查步骤**:
1. 确认 comment_reads 表已创建
2. 检查评论的 mentions 字段是否正确
3. 查看浏览器控制台错误
4. 检查后端日志

**解决方案**:
```bash
# 检查 comment_reads 表
psql -U postgres -d ganttxa -c "\d comment_reads"

# 检查评论数据
psql -U postgres -d ganttxa -c "SELECT id, content, mentions FROM comments LIMIT 5;"

# 重新运行迁移
./scripts/migrate-m3-notifications.sh
```

### 问题 3: 未读数量不准确

**症状**: 通知图标显示的数字不正确

**解决方案**:
1. 刷新页面
2. 点击"全部标记为已读"
3. 清除浏览器缓存
4. 检查数据库数据一致性

```sql
-- 检查未读通知数量
SELECT COUNT(*) 
FROM comments c
WHERE 'YOUR_USER_ID' = ANY(c.mentions)
AND NOT EXISTS (
  SELECT 1 FROM comment_reads cr 
  WHERE cr.comment_id = c.id AND cr.user_id = 'YOUR_USER_ID'
);
```

---

## 🎓 最佳实践

### 1. 合理使用 @ 提及

✅ **推荐做法**:
- 需要特定人员关注时使用
- 提及相关负责人
- 一次提及 1-3 人

❌ **不推荐做法**:
- 每条评论都提及所有人
- 提及无关人员
- 滥用提及功能

### 2. 及时处理通知

✅ **推荐做法**:
- 每天至少查看一次通知
- 看到提及后及时回复
- 处理完后标记为已读

❌ **不推荐做法**:
- 长期不查看通知
- 忽略重要提及
- 不标记已读导致混乱

### 3. 保持通知整洁

✅ **推荐做法**:
- 定期清理已读通知
- 使用过滤器快速查找
- 及时回复避免堆积

❌ **不推荐做法**:
- 从不标记已读
- 让通知堆积
- 不使用过滤功能

---

## 📈 性能优化

### 前端优化

1. **防抖搜索**: 输入 @ 后 300ms 才发起请求
2. **结果缓存**: 相同搜索词使用缓存结果
3. **定时刷新**: 每 30 秒刷新一次未读数量
4. **虚拟滚动**: 大量通知时使用虚拟滚动

### 后端优化

1. **索引优化**: 
   - comment_reads 表添加索引
   - mentions 字段使用 GIN 索引
2. **查询优化**:
   - 使用 EXISTS 子查询
   - 限制返回结果数量
3. **缓存策略**:
   - Redis 缓存用户列表
   - 缓存未读数量

---

## 🔜 后续功能

### 即将推出
- ⏳ 点击通知自动打开评论对话框
- ⏳ 通知缓存优化
- ⏳ 邮件通知
- ⏳ 浏览器推送通知

### 长期规划
- ⏳ 实时通知（WebSocket）
- ⏳ 通知设置（开关、频率）
- ⏳ 通知分组
- ⏳ 通知统计

---

## 📚 相关文档

- [M3 通知功能更新文档](M3-NOTIFICATION-UPDATE.md)
- [M3 功能详细文档](docs/M3-FEATURES.md)
- [开发进度报告](DEVELOPMENT-PROGRESS.md)
- [API 文档](docs/API.md)

---

## 🆘 获取帮助

### 问题反馈
- GitHub Issues: https://github.com/fukkix/gattxa/issues

### 功能建议
- GitHub Discussions: https://github.com/fukkix/gattxa/discussions

### 技术支持
- 查看文档：[docs/](docs/)
- 查看 API 文档：[docs/API.md](docs/API.md)

---

**祝您使用愉快！** 🎉

如有任何问题，请随时联系我们。

---

**文档维护**: GanttXa Development Team  
**最后更新**: 2026-04-13  
**版本**: 1.2.0 (M3 通知功能)
