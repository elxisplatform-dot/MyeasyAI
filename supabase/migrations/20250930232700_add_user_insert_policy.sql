/*
  # Add INSERT Policy for Users Table

  1. Changes
    - Add INSERT policy to allow new users to create their own user records during registration
    
  2. Security
    - Policy ensures users can only insert records with their own auth.uid()
    - Maintains data integrity by validating id matches auth.uid()
    - Prevents users from creating records for other users
    
  3. Important Notes
    - This policy is essential for user registration to work properly
    - Without this policy, signUp attempts to insert into users table fail silently
    - The policy is restrictive and only allows self-registration
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own data during signup" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
