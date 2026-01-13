import { Database } from './database.types'

// User types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserRole = Database['public']['Enums']['user_role']

// Talent profile types
export type TalentProfile = Database['public']['Tables']['talent_profiles']['Row']
export type TalentProfileInsert = Database['public']['Tables']['talent_profiles']['Insert']
export type TalentProfileUpdate = Database['public']['Tables']['talent_profiles']['Update']
export type AvailabilityStatus = Database['public']['Enums']['availability_status']

// Founder profile types
export type FounderProfile = Database['public']['Tables']['founder_profiles']['Row']
export type FounderProfileInsert = Database['public']['Tables']['founder_profiles']['Insert']

// Company types
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']

// Skill types
export type Skill = Database['public']['Tables']['skills']['Row']
export type SkillInsert = Database['public']['Tables']['skills']['Insert']

// Tag types
export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']

// Past role types
export type PastRole = Database['public']['Tables']['past_roles']['Row']
export type PastRoleInsert = Database['public']['Tables']['past_roles']['Insert']
export type PastRoleUpdate = Database['public']['Tables']['past_roles']['Update']

// Invite types
export type Invite = Database['public']['Tables']['invites']['Row']
export type InviteInsert = Database['public']['Tables']['invites']['Insert']

// Shortlist types
export type Shortlist = Database['public']['Tables']['shortlists']['Row']
export type ShortlistInsert = Database['public']['Tables']['shortlists']['Insert']

// Intro request types
export type IntroRequest = Database['public']['Tables']['intro_requests']['Row']
export type IntroRequestInsert = Database['public']['Tables']['intro_requests']['Insert']
export type IntroRequestStatus = Database['public']['Enums']['intro_request_status']

// Extended types with joined data
export type TalentProfileWithSkills = TalentProfile & {
  skills: Skill[]
  past_roles: PastRole[]
}

export type TalentProfileWithRelations = TalentProfile & {
  skills: Skill[]
  past_roles: PastRole[]
  tags?: Tag[]
}

export type IntroRequestWithRelations = IntroRequest & {
  founder: FounderProfile & {
    company: Company | null
  }
  talent: TalentProfile
}

export type ShortlistWithTalent = Shortlist & {
  talent: TalentProfile
}
