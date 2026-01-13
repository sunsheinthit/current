-- Fix: Create founder profile for existing user
-- Replace 'your-email@example.com' with your email

-- Create founder profile if it doesn't exist
INSERT INTO founder_profiles (user_id, name, created_at)
SELECT
  id,
  email,
  NOW()
FROM auth.users
WHERE email = 'leothit877@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the founder profile was created
SELECT
  u.email,
  u.role,
  fp.id as founder_profile_id,
  fp.name
FROM users u
LEFT JOIN founder_profiles fp ON u.id = fp.user_id
WHERE u.email = 'leothit877@gmail.com';
