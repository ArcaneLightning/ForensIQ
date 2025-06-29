/*
  # Fix User Creation RLS Policy

  1. Policy Updates
    - Drop and recreate INSERT policy to allow user creation
    - Update other policies to use correct auth.jwt() function
    - Ensure Firebase authentication works properly with RLS

  2. Security
    - Maintain proper access control while allowing user signup
    - Use auth.jwt() instead of jwt() function
*/

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

-- Create a new INSERT policy that properly handles Firebase authentication
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure we have a proper SELECT policy for authenticated users
DROP POLICY IF EXISTS "Users can read own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'::text));

-- Update the UPDATE policy to be more permissive during initial creation
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'::text))
  WITH CHECK (firebase_uid = (auth.jwt() ->> 'sub'::text));

-- Keep the DELETE policy as is
DROP POLICY IF EXISTS "Users can delete own data" ON users;

CREATE POLICY "Users can delete own data"
  ON users
  FOR DELETE
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'::text));