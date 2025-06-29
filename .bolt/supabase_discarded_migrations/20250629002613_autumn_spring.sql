/*
  # Fix Users Table INSERT Policy

  1. Security Changes
    - Drop the existing INSERT policy for users table
    - Create a new INSERT policy that properly validates Firebase UID
    - Allow authenticated users to insert their own user record where firebase_uid matches JWT sub claim

  This fixes the RLS violation error when creating new user records during authentication.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

-- Create a new INSERT policy that properly validates the Firebase UID
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (firebase_uid = (jwt() ->> 'sub'::text));