/*
  # Fix RLS policies for Firebase authentication

  1. Policy Updates
    - Update users table policies to work with Firebase authentication
    - Allow anon users to insert during signup process
    - Ensure authenticated users can manage their own data

  2. Security
    - Maintain RLS on users table
    - Update policies to work with Firebase JWT structure
    - Add proper checks for user data access
*/

-- Drop existing policies that rely on Supabase auth
DROP POLICY IF EXISTS "Allow anon to insert users during signup" ON users;
DROP POLICY IF EXISTS "Allow authenticated to insert users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies that work with Firebase authentication
-- Allow anonymous users to insert users (needed for initial signup)
CREATE POLICY "Allow user creation during signup"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own data based on firebase_uid
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (firebase_uid = auth.jwt() ->> 'sub');

-- Allow authenticated users to update their own data based on firebase_uid
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = auth.jwt() ->> 'sub')
  WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

-- Allow authenticated users to delete their own data based on firebase_uid
CREATE POLICY "Users can delete own data"
  ON users
  FOR DELETE
  TO authenticated
  USING (firebase_uid = auth.jwt() ->> 'sub');