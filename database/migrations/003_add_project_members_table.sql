-- 创建项目成员表
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '{"view": true, "comment": true, "edit": false, "manage": false}'::jsonb,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  joined_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(project_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON project_members(role);
CREATE INDEX IF NOT EXISTS idx_project_members_status ON project_members(status);

-- 创建项目邀请表
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '{"view": true, "comment": true, "edit": false, "manage": false}'::jsonb,
  token VARCHAR(64) UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  CONSTRAINT valid_invitation_role CHECK (role IN ('admin', 'member', 'viewer')),
  CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON project_invitations(status);

-- 为现有项目添加所有者成员记录
INSERT INTO project_members (project_id, user_id, role, permissions, joined_at, status)
SELECT 
  id as project_id,
  user_id,
  'owner' as role,
  '{"view": true, "comment": true, "edit": true, "manage": true}'::jsonb as permissions,
  created_at as joined_at,
  'active' as status
FROM projects
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 添加注释
COMMENT ON TABLE project_members IS '项目成员表';
COMMENT ON COLUMN project_members.role IS '角色: owner(所有者), admin(管理员), member(成员), viewer(查看者)';
COMMENT ON COLUMN project_members.permissions IS '权限: view(查看), comment(评论), edit(编辑), manage(管理)';
COMMENT ON COLUMN project_members.status IS '状态: pending(待加入), active(活跃), inactive(非活跃)';

COMMENT ON TABLE project_invitations IS '项目邀请表';
COMMENT ON COLUMN project_invitations.status IS '状态: pending(待接受), accepted(已接受), expired(已过期), revoked(已撤销)';
