-- Make a user a founder
-- Replace 'your-email@example.com' with the actual email address

-- Step 1: Get the user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Insert/Update the user role to founder
INSERT INTO users (id, email, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'your-email@example.com',
  'founder',
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET role = 'founder', updated_at = NOW();

-- Step 3: Create founder profile
INSERT INTO founder_profiles (user_id, name, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  (SELECT email FROM auth.users WHERE email = 'your-email@example.com'),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Verify
SELECT u.email, u.role, fp.name
FROM users u
LEFT JOIN founder_profiles fp ON u.id = fp.user_id
WHERE u.email = 'your-email@example.com';
