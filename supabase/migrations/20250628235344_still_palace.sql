/*
  # Create practice sessions table

  1. New Tables
    - `practice_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `topic` (text)
      - `duration` (integer, in seconds)
      - `audio_url` (text, optional)
      - `transcript` (text, optional)
      - `analysis` (jsonb) - Contains AI analysis results
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `practice_sessions` table
    - Add policy for users to manage their own sessions
*/

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  audio_url text,
  transcript text,
  analysis jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own practice sessions"
  ON practice_sessions
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update own practice sessions"
  ON practice_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete own practice sessions"
  ON practice_sessions
  FOR DELETE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS practice_sessions_user_id_idx ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS practice_sessions_created_at_idx ON practice_sessions(created_at DESC);