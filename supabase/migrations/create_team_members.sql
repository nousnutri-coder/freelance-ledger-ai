-- Migration: create_team_members_table
-- Run this in Supabase SQL Editor

-- Create team_members table for TEAM plan
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_email TEXT NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  permissions JSONB DEFAULT '{
    "dashboard": { "view": true, "edit": false },
    "clients": { "view": true, "edit": false, "delete": false },
    "quotations": { "view": true, "edit": false, "delete": false },
    "calendar": { "view": true, "edit": false },
    "finances": { "view": false, "edit": false },
    "settings": { "view": false, "edit": false }
  }',
  status TEXT CHECK (status IN ('pending', 'active', 'revoked')) DEFAULT 'pending',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(team_owner_id, member_email)
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Team owners can manage their team members"
  ON team_members FOR ALL
  USING (team_owner_id = auth.uid());

CREATE POLICY "Team members can view their own membership"
  ON team_members FOR SELECT
  USING (member_id = auth.uid());

-- Indexes for faster lookups
CREATE INDEX idx_team_members_owner ON team_members(team_owner_id);
CREATE INDEX idx_team_members_member ON team_members(member_id);
CREATE INDEX idx_team_members_email ON team_members(member_email);
