/*
  # Create debate sessions table

  1. New Tables
    - `debate_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `topic` (text)
      - `user_position` (enum: pro, con)
      - `user_score` (integer)
      - `ai_score` (integer)
      - `messages` (jsonb) - Array of debate messages
      - `duration` (integer, in seconds)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `debate_sessions` table
    - Add policy for users to manage their own sessions
*/

-- Create enum for debate positions
CREATE TYPE debate_position AS ENUM ('pro', 'con');

-- Create debate_sessions table
CREATE TABLE IF NOT EXISTS debate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  user_position debate_position NOT NULL,
  user_score integer NOT NULL DEFAULT 0,
  ai_score integer NOT NULL DEFAULT 0,
  messages jsonb NOT NULL DEFAULT '[]',
  duration integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE debate_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own debate sessions"
  ON debate_sessions
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own debate sessions"
  ON debate_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update own debate sessions"
  ON debate_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete own debate sessions"
  ON debate_sessions
  FOR DELETE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS debate_sessions_user_id_idx ON debate_sessions(user_id);
CREATE INDEX IF NOT EXISTS debate_sessions_created_at_idx ON debate_sessions(created_at DESC);