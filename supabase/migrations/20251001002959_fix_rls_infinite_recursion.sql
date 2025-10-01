/*
  # Fix RLS Infinite Recursion Error

  1. Problem Summary
    - The "Admins can view all users" policy creates infinite recursion
    - Policy queries the users table to check admin role
    - This triggers RLS evaluation which queries users table again (infinite loop)
    
  2. Solution
    - Create a SECURITY DEFINER function to safely check admin status
    - This function bypasses RLS when checking the role
    - Drop the problematic admin policies
    - Recreate them using the safe function
    
  3. Changes Made
    - Add `is_admin()` security definer function
    - Drop and recreate "Admins can view all users" policy using safe function
    - Drop and recreate "Admins can manage documents" policy using safe function
    
  4. Security Notes
    - SECURITY DEFINER functions run with creator privileges (bypass RLS)
    - The is_admin() function only checks current user's role
    - Cannot be exploited to check other users' roles
    - Safe for use in RLS policies
*/

-- Create a security definer function to check if current user is admin
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage documents" ON documents;

-- Recreate admin policy for users using the safe function
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT 
  USING (is_admin());

-- Recreate admin policy for documents using the safe function
CREATE POLICY "Admins can manage documents" ON documents
  FOR ALL 
  USING (is_admin());
