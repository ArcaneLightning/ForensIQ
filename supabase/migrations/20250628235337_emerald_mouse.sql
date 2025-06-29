/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `firebase_uid` (text, unique) - Links to Firebase Auth
      - `name` (text)
      - `email` (text, unique)
      - `avatar_url` (text, optional)
      - `role` (enum: student, coach, admin)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'coach', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = auth.jwt() ->> 'sub')
  WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();