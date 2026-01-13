-- Make a user an admin
-- Replace 'your-email@example.com' with the actual email address

-- Step 1: Get the user ID (you'll see the ID in the output)
SELECT id, email FROM auth.users WHERE email = 'leothit877@gmail.com';

-- Step 2: Insert/Update the user role to admin (copy the ID from step 1)
INSERT INTO users (id, email, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'leothit877@gmail.com'),
  'leothit877@gmail.com',
  'admin',
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Step 3: Verify the update
SELECT id, email, role FROM users WHERE email = 'leothit877@gmail.com';
