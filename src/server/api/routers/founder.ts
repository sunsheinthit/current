// @ts-nocheck
import { z } from 'zod'
import { createTRPCRouter, founderProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const founderRouter = createTRPCRouter({
  /**
   * Get paginated list of visible talent profiles
   */
  getTalentList: founderProcedure
    .input(
      z.object({
        search: z.string().optional(),
        availability: z.enum(['available', 'not_looking', 'passive']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('talent_profiles')
        .select('*', { count: 'exact' })
        .eq('visible_to_founders', true)

      // Apply filters
      if (input.availability) {
        query = query.eq('availability', input.availability)
      }

      // Apply full-text search if provided
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

      // Exclude internal fields from response
      const sanitizedData = (data || []).map((profile: any) => {
        const { internal_notes, internal_rating, search_vector, ...publicProfile } = profile
        return publicProfile
      })

      return {
        talent: sanitizedData,
        total: count || 0,
      }
    }),

  /**
   * Get a single talent profile (if visible)
   */
  getTalentProfile: founderProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: profile, error } = await ctx.supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', input.id)
        .eq('visible_to_founders', true)
        .single()

      if (error || !profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Talent profile not found or not visible',
        })
      }

      // Get skills
      const { data: talentSkills } = await ctx.supabase
        .from('talent_skills')
        .select('skill_id, skills(*)')
        .eq('talent_profile_id', input.id)

      const skills = (talentSkills || []).map((ts: any) => ts.skills).filter(Boolean)

      // Get past roles
      const { data: pastRoles } = await ctx.supabase
        .from('past_roles')
        .select('*')
        .eq('talent_profile_id', input.id)
        .order('start_date', { ascending: false })

      // Remove internal fields
      const { internal_notes, internal_rating, search_vector, ...publicProfile } = profile

      return {
        ...publicProfile,
        skills: skills || [],
        past_roles: pastRoles || [],
      }
    }),

  /**
   * Add talent to shortlist
   */
  addToShortlist: founderProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get founder profile
      const { data: founderProfile } = await ctx.supabase
        .from('founder_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!founderProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Founder profile not found',
        })
      }

      // Verify talent is visible
      const { data: talent } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('id', input.talentId)
        .eq('visible_to_founders', true)
        .single()

      if (!talent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Talent profile not found or not visible',
        })
      }

      // Add to shortlist (or update if already exists)
      const { data, error } = await ctx.supabase
        .from('shortlists')
        .upsert({
          founder_id: founderProfile.id,
          talent_profile_id: input.talentId,
          notes: input.notes || null,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add to shortlist',
        })
      }

      return data
    }),

  /**
   * Remove talent from shortlist
   */
  removeFromShortlist: founderProcedure
    .input(z.object({ talentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get founder profile
      const { data: founderProfile } = await ctx.supabase
        .from('founder_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!founderProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Founder profile not found',
        })
      }

      const { error } = await ctx.supabase
        .from('shortlists')
        .delete()
        .eq('founder_id', founderProfile.id)
        .eq('talent_profile_id', input.talentId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove from shortlist',
        })
      }

      return { success: true }
    }),

  /**
   * Get own shortlist
   */
  getMyShortlist: founderProcedure.query(async ({ ctx }) => {
    // Get founder profile
    const { data: founderProfile } = await ctx.supabase
      .from('founder_profiles')
      .select('id')
      .eq('user_id', ctx.user.id)
      .single()

    if (!founderProfile) {
      return []
    }

    const { data: shortlists, error } = await ctx.supabase
      .from('shortlists')
      .select('*, talent_profiles(*)')
      .eq('founder_id', founderProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    // Sanitize talent profiles (remove internal fields)
    return (shortlists || []).map((shortlist: any) => {
      const { internal_notes, internal_rating, search_vector, ...publicProfile } = shortlist.talent_profiles
      return {
        ...shortlist,
        talent_profiles: publicProfile,
      }
    })
  }),

  /**
   * Update shortlist notes
   */
  updateShortlistNote: founderProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        notes: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get founder profile
      const { data: founderProfile } = await ctx.supabase
        .from('founder_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!founderProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Founder profile not found',
        })
      }

      const { data, error } = await ctx.supabase
        .from('shortlists')
        .update({ notes: input.notes })
        .eq('founder_id', founderProfile.id)
        .eq('talent_profile_id', input.talentId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update shortlist notes',
        })
      }

      return data
    }),

  /**
   * Request intro to talent
   */
  requestIntro: founderProcedure
    .input(
      z.object({
        talentId: z.string().uuid(),
        message: z.string().min(10, 'Message must be at least 10 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get founder profile
      const { data: founderProfile } = await ctx.supabase
        .from('founder_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!founderProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Founder profile not found',
        })
      }

      // Verify talent is visible
      const { data: talent } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('id', input.talentId)
        .eq('visible_to_founders', true)
        .single()

      if (!talent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Talent profile not found or not visible',
        })
      }

      // Create intro request
      const { data, error } = await ctx.supabase
        .from('intro_requests')
        .insert({
          founder_id: founderProfile.id,
          talent_profile_id: input.talentId,
          message: input.message,
          status: 'pending',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create intro request',
        })
      }

      return data
    }),

  /**
   * Get own intro requests
   */
  getMyIntroRequests: founderProcedure.query(async ({ ctx }) => {
    // Get founder profile
    const { data: founderProfile } = await ctx.supabase
      .from('founder_profiles')
      .select('id')
      .eq('user_id', ctx.user.id)
      .single()

    if (!founderProfile) {
      return []
    }

    const { data: introRequests, error } = await ctx.supabase
      .from('intro_requests')
      .select('*, talent_profiles(*)')
      .eq('founder_id', founderProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    // Sanitize talent profiles (remove internal fields)
    return (introRequests || []).map((request: any) => {
      const { internal_notes, internal_rating, search_vector, ...publicProfile } = request.talent_profiles
      return {
        ...request,
        talent_profiles: publicProfile,
      }
    })
  }),

  /**
   * Cancel a pending intro request
   */
  cancelIntroRequest: founderProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get founder profile
      const { data: founderProfile } = await ctx.supabase
        .from('founder_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!founderProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Founder profile not found',
        })
      }

      // Delete only if pending and belongs to this founder
      const { error } = await ctx.supabase
        .from('intro_requests')
        .delete()
        .eq('id', input.id)
        .eq('founder_id', founderProfile.id)
        .eq('status', 'pending')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel intro request',
        })
      }

      return { success: true }
    }),
})
