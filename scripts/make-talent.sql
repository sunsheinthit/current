-- Make a user a talent member
-- Replace 'your-email@example.com' with the actual email address

-- Step 1: Get the user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Insert/Update the user role to talent
INSERT INTO users (id, email, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'your-email@example.com',
  'talent',
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET role = 'talent', updated_at = NOW();

-- Step 3: Create talent profile
INSERT INTO talent_profiles (user_id, name, availability, visible_to_founders, is_approved, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  (SELECT email FROM auth.users WHERE email = 'your-email@example.com'),
  'passive',
  false,
  false,
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Verify
SELECT u.email, u.role, tp.name, tp.availability
FROM users u
LEFT JOIN talent_profiles tp ON u.id = tp.user_id
WHERE u.email = 'your-email@example.com';
