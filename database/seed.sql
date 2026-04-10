-- GanttFlow 测试数据

-- 插入测试用户
INSERT INTO users (email, password_hash, display_name) VALUES
('test@example.com', '$2b$10$YourHashedPasswordHere', '测试用户'),
('demo@example.com', '$2b$10$YourHashedPasswordHere', '演示用户')
ON CONFLICT (email) DO NOTHING;

-- 获取测试用户 ID（假设为第一个用户）
DO $$
DECLARE
  test_user_id UUID;
  test_project_id UUID;
BEGIN
  -- 获取测试用户 ID
  SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com' LIMIT 1;

  -- 插入测试项目
  INSERT INTO projects (user_id, name, description)
  VALUES (test_user_id, '网站重构项目', '公司官网全面升级改造')
  RETURNING id INTO test_project_id;

  -- 插入测试任务
  INSERT INTO tasks (project_id, name, start_date, end_date, assignee, phase, description, is_milestone, position) VALUES
  (test_project_id, '需求调研', '2026-04-10', '2026-04-15', '张三', '阶段一', '收集用户需求和竞品分析', false, 0),
  (test_project_id, '原型设计', '2026-04-16', '2026-04-22', '李四', '阶段一', '设计页面原型和交互流程', false, 1),
  (test_project_id, '设计评审', '2026-04-23', '2026-04-23', '王五', '阶段一', '设计方案评审会议', true, 2),
  
  (test_project_id, '前端开发', '2026-04-24', '2026-05-10', '赵六', '阶段二', 'React 前端页面开发', false, 3),
  (test_project_id, '后端开发', '2026-04-24', '2026-05-08', '钱七', '阶段二', 'Node.js API 开发', false, 4),
  (test_project_id, '数据库设计', '2026-04-24', '2026-04-28', '孙八', '阶段二', 'PostgreSQL 数据库设计', false, 5),
  
  (test_project_id, '单元测试', '2026-05-11', '2026-05-15', '周九', '阶段三', '编写单元测试和集成测试', false, 6),
  (test_project_id, '性能优化', '2026-05-16', '2026-05-20', '吴十', '阶段三', '前后端性能优化', false, 7),
  (test_project_id, '测试完成', '2026-05-20', '2026-05-20', '郑十一', '阶段三', '测试阶段完成', true, 8),
  
  (test_project_id, 'UAT 测试', '2026-05-21', '2026-05-25', '王十二', '阶段四', '用户验收测试', false, 9),
  (test_project_id, 'Bug 修复', '2026-05-26', '2026-05-30', '李十三', '阶段四', '修复测试发现的问题', false, 10),
  
  (test_project_id, '部署上线', '2026-05-31', '2026-06-02', '张十四', '阶段五', '生产环境部署', false, 11),
  (test_project_id, '项目验收', '2026-06-03', '2026-06-03', '赵十五', '阶段五', '项目最终验收', true, 12);

  RAISE NOTICE '测试数据插入成功！项目 ID: %', test_project_id;
END $$;
