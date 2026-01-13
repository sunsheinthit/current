-- Check which profiles exist for a user
-- Replace 'your-email@example.com' with your email

SELECT
  u.id,
  u.email,
  u.role,
  CASE WHEN tp.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_talent_profile,
  CASE WHEN fp.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_founder_profile
FROM users u
LEFT JOIN talent_profiles tp ON u.id = tp.user_id
LEFT JOIN founder_profiles fp ON u.id = fp.user_id
WHERE u.email = 'leothit877@gmail.com';
