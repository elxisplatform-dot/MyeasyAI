/*
  # Create Admin User Function

  1. Function
    - `create_admin_user` - Promotes a user to admin role
    - Security definer for elevated permissions

  2. Usage
    - Call after creating admin account
    - Example: SELECT create_admin_user('admin@easyai.com');
*/

-- Create admin user function (call after user signs up)
CREATE OR REPLACE FUNCTION create_admin_user(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET role = 'admin'
  WHERE email = user_email;
  
  -- Log the admin creation
  INSERT INTO admin_notifications (message, target_roles)
  VALUES (
    'New admin user created: ' || user_email,
    ARRAY['admin']
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (uncomment and replace with your admin email):
-- SELECT create_admin_user('admin@easyai.com');