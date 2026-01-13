-- Create test data for Pebblebed Current
-- This creates a test talent profile that's visible to founders

-- 1. Create a test talent user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'talent-test@pebblebed.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 2. Add to users table with talent role
INSERT INTO users (id, email, role, created_at)
SELECT
  id,
  'talent-test@pebblebed.com',
  'talent',
  NOW()
FROM auth.users
WHERE email = 'talent-test@pebblebed.com'
ON CONFLICT (id) DO UPDATE SET role = 'talent';

-- 3. Create talent profile that's visible to founders
INSERT INTO talent_profiles (
  user_id,
  name,
  bio,
  location,
  availability,
  linkedin_url,
  github_url,
  visible_to_founders,
  is_approved,
  created_at
)
SELECT
  u.id,
  'John Doe',
  'Experienced software engineer with 10+ years building scalable web applications. Passionate about clean code and user experience.',
  'San Francisco, CA',
  'passive',
  'https://linkedin.com/in/johndoe',
  'https://github.com/johndoe',
  true,  -- Make visible to founders
  true,  -- Approved by admin
  NOW()
FROM auth.users u
WHERE u.email = 'talent-test@pebblebed.com'
ON CONFLICT (user_id) DO UPDATE SET
  visible_to_founders = true,
  is_approved = true;

-- 4. Add some skills to the talent
INSERT INTO skills (name) VALUES ('React'), ('TypeScript'), ('Node.js'), ('PostgreSQL')
ON CONFLICT (name) DO NOTHING;

INSERT INTO talent_skills (talent_profile_id, skill_id)
SELECT
  tp.id,
  s.id
FROM talent_profiles tp
CROSS JOIN skills s
WHERE tp.user_id = (SELECT id FROM auth.users WHERE email = 'talent-test@pebblebed.com')
  AND s.name IN ('React', 'TypeScript', 'Node.js', 'PostgreSQL')
ON CONFLICT DO NOTHING;

-- 5. Add work experience
INSERT INTO past_roles (
  talent_profile_id,
  company_name,
  title,
  start_date,
  end_date,
  description
)
SELECT
  tp.id,
  'Tech Startup Inc',
  'Senior Software Engineer',
  '2020-01-01',
  NULL,
  'Leading the development of core platform features. Built scalable microservices architecture handling 1M+ requests/day.'
FROM talent_profiles tp
WHERE tp.user_id = (SELECT id FROM auth.users WHERE email = 'talent-test@pebblebed.com')
ON CONFLICT DO NOTHING;

-- Verify the data was created
SELECT
  u.email,
  tp.name,
  tp.location,
  tp.visible_to_founders,
  tp.is_approved,
  COUNT(ts.skill_id) as skill_count,
  COUNT(pr.id) as role_count
FROM users u
JOIN talent_profiles tp ON u.id = tp.user_id
LEFT JOIN talent_skills ts ON tp.id = ts.talent_profile_id
LEFT JOIN past_roles pr ON tp.id = pr.talent_profile_id
WHERE u.email = 'talent-test@pebblebed.com'
GROUP BY u.email, tp.name, tp.location, tp.visible_to_founders, tp.is_approved;
