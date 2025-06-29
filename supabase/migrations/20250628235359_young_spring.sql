/*
  # Create teams and team members tables

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `user_id` (uuid, foreign key to users)
      - `role` (enum: leader, member)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for team management
*/

-- Create enum for team member roles
CREATE TYPE team_member_role AS ENUM ('leader', 'member');

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role team_member_role NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can read teams they are members of"
  ON teams
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Team leaders can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
    ) AND role = 'leader'
  ))
  WITH CHECK (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
    ) AND role = 'leader'
  ));

-- Team members policies
CREATE POLICY "Users can read team members of their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Team leaders can manage members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
    ) AND role = 'leader'
  ))
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (
      SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
    ) AND role = 'leader'
  ));

-- Create updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS teams_created_by_idx ON teams(created_by);
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);