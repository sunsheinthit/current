# User Role Management Scripts

These scripts help you assign roles to users in Pebblebed Current.

## Prerequisites

Make sure you have:
- A `.env.local` file with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- The user has already signed up through the web interface

## Usage

### Make a user an Admin

```bash
node scripts/make-admin.js user@example.com
```

Admins can:
- Manage talent profiles
- Send invites
- Review intro requests
- Access `/admin/dashboard`

### Make a user a Talent member

```bash
node scripts/make-talent.js user@example.com
```

Talent members can:
- Create and edit their profile
- Add skills and experience
- Access `/talent/dashboard`

### Make a user a Founder

```bash
node scripts/make-founder.js user@example.com
```

Founders can:
- Browse talent directory
- Create shortlists
- Request introductions
- Access `/founder/dashboard`

## Workflow

1. User signs up at `/auth/signup`
2. User is redirected to `/pending` (no role assigned yet)
3. Run one of the scripts above to assign a role
4. User can now log out and log back in to access their dashboard

## Example

```bash
# Sign up a new user first through the web interface
# Then run:
node scripts/make-admin.js admin@pebblebed.com
```

The user will now have admin access when they log in.
