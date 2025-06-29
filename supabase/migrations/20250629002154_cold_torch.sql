/*
  # Fix user RLS policies for signup

  1. Policy Changes
    - Allow anonymous users to insert user records during signup
    - Allow authenticated users to insert user records with proper firebase_uid check
    - Use auth.jwt() instead of jwt() function

  2. Security
    - Anonymous policy allows initial user creation during signup
    - Authenticated policy ensures firebase_uid matches the JWT subject
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Allow anonymous users to insert their own user records during signup
CREATE POLICY "Allow anon to insert users during signup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to insert (in case they're already authenticated)
CREATE POLICY "Allow authenticated to insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (firebase_uid = (auth.jwt() ->> 'sub'::text));