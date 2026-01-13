-- =====================================================
-- Pebblebed Current - VC Talent Pool Database Schema
-- =====================================================

-- Step 1: Drop existing notes infrastructure
DROP TABLE IF EXISTS public.notes CASCADE;

-- Step 2: Create custom types (enums)
CREATE TYPE user_role AS ENUM ('admin', 'founder', 'talent');
CREATE TYPE availability_status AS ENUM ('available', 'not_looking', 'passive');
CREATE TYPE intro_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Step 3: Core user extension
CREATE TABLE public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'talent',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Step 4: Companies (portfolio companies)
CREATE TABLE public.companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  industry text,
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Step 5: Talent profiles
CREATE TABLE public.talent_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  photo_url text,
  bio text,
  location text,
  roles_interested text[] DEFAULT '{}',
  linkedin_url text,
  github_url text,
  availability availability_status DEFAULT 'passive',
  visible_to_founders boolean DEFAULT false,
  internal_notes text,
  internal_rating integer CHECK (internal_rating >= 1 AND internal_rating <= 5),
  search_vector tsvector,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Trigger function to update search_vector
CREATE OR REPLACE FUNCTION public.talent_profiles_search_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.bio, '') || ' ' ||
    coalesce(array_to_string(NEW.roles_interested, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search_vector
CREATE TRIGGER talent_profiles_search_update
  BEFORE INSERT OR UPDATE ON public.talent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.talent_profiles_search_trigger();

-- Step 6: Skills system
CREATE TABLE public.skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.talent_skills (
  talent_profile_id uuid REFERENCES public.talent_profiles ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES public.skills ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (talent_profile_id, skill_id)
);

-- Step 7: Tags system (internal only)
CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.talent_tags (
  talent_profile_id uuid REFERENCES public.talent_profiles ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (talent_profile_id, tag_id)
);

-- Step 8: Past roles (work history)
CREATE TABLE public.past_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id uuid REFERENCES public.talent_profiles ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Step 9: Founder profiles
CREATE TABLE public.founder_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL UNIQUE,
  company_id uuid REFERENCES public.companies ON DELETE SET NULL,
  name text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Step 10: Invites system
CREATE TABLE public.invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  invited_by uuid REFERENCES public.users ON DELETE SET NULL,
  accepted boolean DEFAULT false,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Step 11: Shortlists (founder's saved talent)
CREATE TABLE public.shortlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id uuid REFERENCES public.founder_profiles ON DELETE CASCADE NOT NULL,
  talent_profile_id uuid REFERENCES public.talent_profiles ON DELETE CASCADE NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(founder_id, talent_profile_id)
);

-- Step 12: Intro requests
CREATE TABLE public.intro_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id uuid REFERENCES public.founder_profiles ON DELETE CASCADE NOT NULL,
  talent_profile_id uuid REFERENCES public.talent_profiles ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  status intro_request_status DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.users ON DELETE SET NULL,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intro_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is founder
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'founder'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is talent
CREATE OR REPLACE FUNCTION public.is_talent()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'talent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (is_admin());

-- Companies table policies
CREATE POLICY "Anyone authenticated can read companies" ON public.companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage companies" ON public.companies
  FOR ALL USING (is_admin());

-- Talent profiles policies
CREATE POLICY "Admins can see all talent profiles" ON public.talent_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Founders can see visible talent profiles" ON public.talent_profiles
  FOR SELECT USING (
    is_founder() AND visible_to_founders = true
  );

CREATE POLICY "Talent can see own profile" ON public.talent_profiles
  FOR SELECT USING (
    is_talent() AND user_id = auth.uid()
  );

CREATE POLICY "Admins can update any talent profile" ON public.talent_profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Talent can update own profile" ON public.talent_profiles
  FOR UPDATE USING (
    is_talent() AND user_id = auth.uid()
  );

CREATE POLICY "Admins can insert talent profiles" ON public.talent_profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Talent can insert own profile" ON public.talent_profiles
  FOR INSERT WITH CHECK (
    is_talent() AND user_id = auth.uid()
  );

-- Skills table policies
CREATE POLICY "Anyone authenticated can read skills" ON public.skills
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage skills" ON public.skills
  FOR ALL USING (is_admin());

CREATE POLICY "Talent can create skills" ON public.skills
  FOR INSERT WITH CHECK (is_talent());

-- Talent skills junction table policies
CREATE POLICY "Admins can see all talent skills" ON public.talent_skills
  FOR SELECT USING (is_admin());

CREATE POLICY "Founders can see skills for visible talent" ON public.talent_skills
  FOR SELECT USING (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND visible_to_founders = true
    )
  );

CREATE POLICY "Talent can see own skills" ON public.talent_skills
  FOR SELECT USING (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all talent skills" ON public.talent_skills
  FOR ALL USING (is_admin());

CREATE POLICY "Talent can manage own skills" ON public.talent_skills
  FOR INSERT WITH CHECK (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Talent can delete own skills" ON public.talent_skills
  FOR DELETE USING (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

-- Tags table policies (admin only)
CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (is_admin());

-- Talent tags junction table policies (admin only)
CREATE POLICY "Admins can manage talent tags" ON public.talent_tags
  FOR ALL USING (is_admin());

-- Past roles policies
CREATE POLICY "Admins can see all past roles" ON public.past_roles
  FOR SELECT USING (is_admin());

CREATE POLICY "Founders can see past roles for visible talent" ON public.past_roles
  FOR SELECT USING (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND visible_to_founders = true
    )
  );

CREATE POLICY "Talent can see own past roles" ON public.past_roles
  FOR SELECT USING (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all past roles" ON public.past_roles
  FOR ALL USING (is_admin());

CREATE POLICY "Talent can manage own past roles" ON public.past_roles
  FOR INSERT WITH CHECK (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Talent can update own past roles" ON public.past_roles
  FOR UPDATE USING (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Talent can delete own past roles" ON public.past_roles
  FOR DELETE USING (
    is_talent() AND EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id AND user_id = auth.uid()
    )
  );

-- Founder profiles policies
CREATE POLICY "Admins can see all founder profiles" ON public.founder_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Founders can see own profile" ON public.founder_profiles
  FOR SELECT USING (
    is_founder() AND user_id = auth.uid()
  );

CREATE POLICY "Admins can manage founder profiles" ON public.founder_profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Founders can update own profile" ON public.founder_profiles
  FOR UPDATE USING (
    is_founder() AND user_id = auth.uid()
  );

-- Invites table policies (admin only)
CREATE POLICY "Admins can manage invites" ON public.invites
  FOR ALL USING (is_admin());

-- Shortlists policies
CREATE POLICY "Admins can see all shortlists" ON public.shortlists
  FOR SELECT USING (is_admin());

CREATE POLICY "Founders can see own shortlists" ON public.shortlists
  FOR SELECT USING (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all shortlists" ON public.shortlists
  FOR ALL USING (is_admin());

CREATE POLICY "Founders can manage own shortlists" ON public.shortlists
  FOR INSERT WITH CHECK (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Founders can update own shortlists" ON public.shortlists
  FOR UPDATE USING (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Founders can delete own shortlists" ON public.shortlists
  FOR DELETE USING (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

-- Intro requests policies
CREATE POLICY "Admins can see all intro requests" ON public.intro_requests
  FOR SELECT USING (is_admin());

CREATE POLICY "Founders can see own intro requests" ON public.intro_requests
  FOR SELECT USING (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all intro requests" ON public.intro_requests
  FOR ALL USING (is_admin());

CREATE POLICY "Founders can create intro requests" ON public.intro_requests
  FOR INSERT WITH CHECK (
    is_founder() AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Founders can delete own pending intro requests" ON public.intro_requests
  FOR DELETE USING (
    is_founder() AND status = 'pending' AND EXISTS (
      SELECT 1 FROM public.founder_profiles
      WHERE id = founder_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- User lookups
CREATE INDEX users_email_idx ON public.users(email);
CREATE INDEX users_role_idx ON public.users(role);

-- Talent profile lookups and search
CREATE INDEX talent_profiles_user_id_idx ON public.talent_profiles(user_id);
CREATE INDEX talent_profiles_visible_idx ON public.talent_profiles(visible_to_founders) WHERE visible_to_founders = true;
CREATE INDEX talent_profiles_availability_idx ON public.talent_profiles(availability);

-- Full-text search index for talent (on generated column)
CREATE INDEX talent_profiles_search_idx ON public.talent_profiles USING gin(search_vector);

-- Invite lookups
CREATE INDEX invites_token_idx ON public.invites(token);
CREATE INDEX invites_email_idx ON public.invites(email);
CREATE INDEX invites_accepted_idx ON public.invites(accepted);

-- Intro request lookups
CREATE INDEX intro_requests_status_idx ON public.intro_requests(status);
CREATE INDEX intro_requests_founder_idx ON public.intro_requests(founder_id);
CREATE INDEX intro_requests_talent_idx ON public.intro_requests(talent_profile_id);

-- Shortlist lookups
CREATE INDEX shortlists_founder_idx ON public.shortlists(founder_id);
CREATE INDEX shortlists_talent_idx ON public.shortlists(talent_profile_id);

-- Past roles lookups
CREATE INDEX past_roles_talent_idx ON public.past_roles(talent_profile_id);

-- Skills lookups
CREATE INDEX skills_name_idx ON public.skills(name);

-- =====================================================
-- Seed Data - Create initial admin user
-- =====================================================

-- Note: You'll need to create the auth.users record first via Supabase Auth,
-- then insert into public.users with the same ID and role='admin'

-- Example (after creating auth user):
-- INSERT INTO public.users (id, email, role)
-- VALUES ('your-auth-user-id', 'admin@example.com', 'admin');

-- Seed some sample companies
INSERT INTO public.companies (name, industry, description) VALUES
  ('Acme Corp', 'Technology', 'Enterprise software solutions'),
  ('StartupXYZ', 'Fintech', 'Financial technology innovators'),
  ('HealthTech Inc', 'Healthcare', 'Digital health platform');

-- Seed some common skills
INSERT INTO public.skills (name) VALUES
  ('JavaScript'), ('TypeScript'), ('React'), ('Node.js'),
  ('Python'), ('SQL'), ('AWS'), ('Docker'),
  ('Product Management'), ('UX Design'), ('Data Analysis'),
  ('Go'), ('Rust'), ('Kubernetes'), ('GraphQL');
