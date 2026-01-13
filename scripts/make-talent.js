#!/usr/bin/env node

/**
 * Script to make a user a talent member
 * Usage: node scripts/make-talent.js <email>
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const email = process.argv[2]

if (!email) {
  console.error('Usage: node scripts/make-talent.js <email>')
  console.error('Example: node scripts/make-talent.js talent@example.com')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function makeTalent() {
  console.log(`Looking for user with email: ${email}`)

  // Get user by email from auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching users:', authError.message)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`Error: No user found with email ${email}`)
    console.error('Make sure the user has signed up first')
    process.exit(1)
  }

  console.log(`Found user: ${user.email} (ID: ${user.id})`)

  // Update user role to talent
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      role: 'talent',
      created_at: new Date().toISOString()
    })

  if (userError) {
    console.error('Error updating user role:', userError.message)
    process.exit(1)
  }

  // Create talent profile
  const { error: profileError } = await supabase
    .from('talent_profiles')
    .upsert({
      user_id: user.id,
      name: user.email.split('@')[0],
      availability: 'passive',
      visible_to_founders: false,
      is_approved: false,
      created_at: new Date().toISOString()
    })

  if (profileError) {
    console.error('Error creating talent profile:', profileError.message)
    process.exit(1)
  }

  console.log('✓ Successfully made user a talent member!')
  console.log('The user can now access /talent/dashboard')
}

makeTalent()
