export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          description: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      founder_profiles: {
        Row: {
          id: string
          user_id: string
          company_id: string | null
          name: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id?: string | null
          name: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string | null
          name?: string
          title?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_profiles_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      intro_requests: {
        Row: {
          id: string
          founder_id: string
          talent_profile_id: string
          message: string
          status: Database['public']['Enums']['intro_request_status']
          reviewed_by: string | null
          reviewed_at: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          talent_profile_id: string
          message: string
          status?: Database['public']['Enums']['intro_request_status']
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          talent_profile_id?: string
          message?: string
          status?: Database['public']['Enums']['intro_request_status']
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intro_requests_founder_id_fkey"
            columns: ["founder_id"]
            referencedRelation: "founder_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intro_requests_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intro_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          id: string
          email: string
          token: string
          invited_by: string | null
          accepted: boolean
          accepted_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          token?: string
          invited_by?: string | null
          accepted?: boolean
          accepted_at?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          token?: string
          invited_by?: string | null
          accepted?: boolean
          accepted_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      past_roles: {
        Row: {
          id: string
          talent_profile_id: string
          company_name: string
          title: string
          start_date: string
          end_date: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          talent_profile_id: string
          company_name: string
          title: string
          start_date: string
          end_date?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          talent_profile_id?: string
          company_name?: string
          title?: string
          start_date?: string
          end_date?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "past_roles_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      shortlists: {
        Row: {
          id: string
          founder_id: string
          talent_profile_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          talent_profile_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          talent_profile_id?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_founder_id_fkey"
            columns: ["founder_id"]
            referencedRelation: "founder_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlists_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      talent_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          photo_url: string | null
          bio: string | null
          location: string | null
          roles_interested: string[]
          linkedin_url: string | null
          github_url: string | null
          availability: Database['public']['Enums']['availability_status']
          visible_to_founders: boolean
          internal_notes: string | null
          internal_rating: number | null
          search_vector: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          photo_url?: string | null
          bio?: string | null
          location?: string | null
          roles_interested?: string[]
          linkedin_url?: string | null
          github_url?: string | null
          availability?: Database['public']['Enums']['availability_status']
          visible_to_founders?: boolean
          internal_notes?: string | null
          internal_rating?: number | null
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          photo_url?: string | null
          bio?: string | null
          location?: string | null
          roles_interested?: string[]
          linkedin_url?: string | null
          github_url?: string | null
          availability?: Database['public']['Enums']['availability_status']
          visible_to_founders?: boolean
          internal_notes?: string | null
          internal_rating?: number | null
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      talent_skills: {
        Row: {
          talent_profile_id: string
          skill_id: string
        }
        Insert: {
          talent_profile_id: string
          skill_id: string
        }
        Update: {
          talent_profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_skills_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      talent_tags: {
        Row: {
          talent_profile_id: string
          tag_id: string
        }
        Insert: {
          talent_profile_id: string
          tag_id: string
        }
        Update: {
          talent_profile_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_tags_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          role: Database['public']['Enums']['user_role']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_founder: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_talent: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      availability_status: 'available' | 'not_looking' | 'passive'
      intro_request_status: 'pending' | 'approved' | 'rejected'
      user_role: 'admin' | 'founder' | 'talent'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
