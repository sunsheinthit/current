// @ts-nocheck
import { z } from 'zod'
import { createTRPCRouter, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const adminRouter = createTRPCRouter({
  // ==================== INVITE MANAGEMENT ====================

  /**
   * Create an invite and return the invite link
   */
  createInvite: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Check if email already has a pending invite
      const { data: existing } = await ctx.supabase
        .from('invites')
        .select('*')
        .eq('email', input.email)
        .eq('accepted', false)
        .single()

      if (existing) {
        const ex = existing as any
        const expiresAt = new Date(ex.expires_at)
        const now = new Date()

        if (now < expiresAt) {
          // Return existing valid invite
          return {
            token: ex.token,
            inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${ex.token}`,
          }
        }
      }

      // Create new invite (expires in 7 days)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { data: invite, error } = await (ctx.supabase as any)
        .from('invites')
        .insert({
          email: input.email,
          invited_by: ctx.user!.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error || !invite) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invite',
        })
      }

      return {
        token: (invite as any).token,
        inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${(invite as any).token}`,
      }
    }),

  /**
   * List all invites
   */
  listInvites: adminProcedure.query(async ({ ctx }) => {
    const { data: invites, error } = await ctx.supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    return invites || []
  }),

  // ==================== TALENT MANAGEMENT ====================

  /**
   * Get all talent profiles with filters (admin sees everything)
   */
  getAllTalent: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        availability: z.enum(['available', 'not_looking', 'passive']).optional(),
        visible: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('talent_profiles')
        .select('*', { count: 'exact' })

      // Apply filters
      if (input.availability) {
        query = query.eq('availability', input.availability)
      }

      if (input.visible !== undefined) {
        query = query.eq('visible_to_founders', input.visible)
      }

      // Apply full-text search
      if (input.search) {
        query = query.textSearch('search_vector', input.search, {
          type: 'websearch',
          config: 'english',
        })
      }

      // Apply pagination
      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch talent',
        })
      }

      return {
        talent: data || [],
        total: count || 0,
      }
    }),

  /**
   * Get complete talent profile (admin sees everything including internal fields)
   */
  getTalentProfile: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: profile, error } = await ctx.supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error || !profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Talent profile not found',
        })
      }

      // Get skills
      const { data: talentSkills } = await ctx.supabase
        .from('talent_skills')
        .select('skill_id, skills(*)')
        .eq('talent_profile_id', input.id)

      const skills = (talentSkills || []).map((ts: any) => ts.skills).filter(Boolean)

      // Get tags
      const { data: talentTags } = await ctx.supabase
        .from('talent_tags')
        .select('tag_id, tags(*)')
        .eq('talent_profile_id', input.id)

      const tags = (talentTags || []).map((tt: any) => tt.tags).filter(Boolean)

      // Get past roles
      const { data: pastRoles } = await ctx.supabase
        .from('past_roles')
        .select('*')
        .eq('talent_profile_id', input.id)
        .order('start_date', { ascending: false })

      return {
        ...(profile as any),
        skills: skills || [],
        tags: tags || [],
        past_roles: pastRoles || [],
      }
    }),

  /**
   * Update any talent profile (admin can edit everything)
   */
  updateTalentProfile: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        roles_interested: z.array(z.string()).optional(),
        linkedin_url: z.string().url().nullable().optional(),
        github_url: z.string().url().nullable().optional(),
        availability: z.enum(['available', 'not_looking', 'passive']).optional(),
        visible_to_founders: z.boolean().optional(),
        photo_url: z.string().url().nullable().optional(),
        internal_notes: z.string().nullable().optional(),
        internal_rating: z.number().min(1).max(5).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const { data, error } = await ctx.supabase
        .from('talent_profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update talent profile',
        })
      }

      return data
    }),

  /**
   * Toggle talent visibility to founders
   */
  toggleVisibility: adminProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        visible: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('talent_profiles')
        .update({
          visible_to_founders: input.visible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.talentId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update visibility',
        })
      }

      return data
    }),

  /**
   * Update internal notes for a talent
   */
  updateInternalNote: adminProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        note: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('talent_profiles')
        .update({
          internal_notes: input.note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.talentId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update internal notes',
        })
      }

      return data
    }),

  /**
   * Set internal rating for a talent
   */
  setInternalRating: adminProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        rating: z.number().min(1).max(5).nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('talent_profiles')
        .update({
          internal_rating: input.rating,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.talentId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update internal rating',
        })
      }

      return data
    }),

  // ==================== TAG MANAGEMENT ====================

  /**
   * Get all tags
   */
  getAllTags: adminProcedure.query(async ({ ctx }) => {
    const { data: tags, error } = await ctx.supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      return []
    }

    return tags || []
  }),

  /**
   * Create a new tag
   */
  createTag: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('tags')
        .insert({
          name: input.name,
          color: input.color || null,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tag',
        })
      }

      return data
    }),

  /**
   * Add a tag to a talent profile
   */
  addTagToTalent: adminProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        tagId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('talent_tags')
        .insert({
          talent_profile_id: input.talentId,
          tag_id: input.tagId,
        })

      // Ignore duplicate key errors
      if (error && !error.message.includes('duplicate')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add tag',
        })
      }

      return { success: true }
    }),

  /**
   * Remove a tag from a talent profile
   */
  removeTagFromTalent: adminProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        tagId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('talent_tags')
        .delete()
        .eq('talent_profile_id', input.talentId)
        .eq('tag_id', input.tagId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove tag',
        })
      }

      return { success: true }
    }),

  // ==================== INTRO REQUEST MANAGEMENT ====================

  /**
   * List all intro requests with optional status filter
   */
  listIntroRequests: adminProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('intro_requests')
        .select('*, founder_profiles(*, companies(*)), talent_profiles(*)')
        .order('created_at', { ascending: false })

      if (input?.status) {
        query = query.eq('status', input.status)
      }

      const { data: introRequests, error } = await query

      if (error) {
        return []
      }

      return introRequests || []
    }),

  /**
   * Review an intro request (approve or reject)
   */
  reviewIntroRequest: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['approved', 'rejected']),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('intro_requests')
        .update({
          status: input.status,
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: input.adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to review intro request',
        })
      }

      return data
    }),
})
