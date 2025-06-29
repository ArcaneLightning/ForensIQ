/*
  # Clean Authentication Setup for Supabase Auth

  1. Clean up existing policies and tables
  2. Create new users table that works with Supabase Auth
  3. Set up proper RLS policies for Supabase authentication

  This migration removes Firebase-specific code and sets up proper Supabase authentication.
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can delete own data" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

-- Drop and recreate users table with proper structure for Supabase Auth
DROP TABLE IF EXISTS users CASCADE;

-- Create users table that works with Supabase Auth
CREATE TABLE users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for Supabase Auth
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Update the updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update practice_sessions policies to work with new users table
DROP POLICY IF EXISTS "Users can read own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can insert own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can update own practice sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can delete own practice sessions" ON practice_sessions;

CREATE POLICY "Users can read own practice sessions"
  ON practice_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own practice sessions"
  ON practice_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own practice sessions"
  ON practice_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Update debate_sessions policies to work with new users table
DROP POLICY IF EXISTS "Users can read own debate sessions" ON debate_sessions;
DROP POLICY IF EXISTS "Users can insert own debate sessions" ON debate_sessions;
DROP POLICY IF EXISTS "Users can update own debate sessions" ON debate_sessions;
DROP POLICY IF EXISTS "Users can delete own debate sessions" ON debate_sessions;

CREATE POLICY "Users can read own debate sessions"
  ON debate_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own debate sessions"
  ON debate_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own debate sessions"
  ON debate_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own debate sessions"
  ON debate_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Update teams policies to work with new users table
DROP POLICY IF EXISTS "Users can read teams they are members of" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team leaders can update teams" ON teams;

CREATE POLICY "Users can read teams they are members of"
  ON teams
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team leaders can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role = 'leader'
  ))
  WITH CHECK (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role = 'leader'
  ));

-- Update team_members policies to work with new users table
DROP POLICY IF EXISTS "Users can read team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;
DROP POLICY IF EXISTS "Team leaders can manage members" ON team_members;

CREATE POLICY "Users can read team members of their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can manage members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role = 'leader'
  ))
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role = 'leader'
  ));