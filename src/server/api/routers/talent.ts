// @ts-nocheck
import { z } from 'zod'
import { createTRPCRouter, talentProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const talentRouter = createTRPCRouter({
  /**
   * Get own talent profile
   */
  getMyProfile: talentProcedure.query(async ({ ctx }) => {
    const { data: profile, error } = await ctx.supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single()

    if (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile not found',
      })
    }

    return profile
  }),

  /**
   * Update own profile (excluding internal fields)
   */
  updateMyProfile: talentProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        roles_interested: z.array(z.string()).optional(),
        linkedin_url: z.string().url().nullable().optional(),
        github_url: z.string().url().nullable().optional(),
        availability: z.enum(['available', 'not_looking', 'passive']).optional(),
        photo_url: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {
        ...input,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await ctx.supabase
        .from('talent_profiles')
        .update(updateData)
        .eq('user_id', ctx.user.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        })
      }

      return data
    }),

  /**
   * Get own skills
   */
  getMySkills: talentProcedure.query(async ({ ctx }) => {
    // First get talent profile ID
    const { data: profile } = await ctx.supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', ctx.user.id)
      .single()

    if (!profile) {
      return []
    }

    // Get skills via junction table
    const { data: talentSkills, error } = await ctx.supabase
      .from('talent_skills')
      .select('skill_id, skills(*)')
      .eq('talent_profile_id', profile.id)

    if (error) {
      return []
    }

    return (talentSkills || []).map((ts: any) => ts.skills).filter(Boolean)
  }),

  /**
   * Add a skill (finds or creates skill, then adds to own profile)
   */
  addSkill: talentProcedure
    .input(z.object({ skillName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Get talent profile ID
      const { data: profile } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }

      // Find or create skill
      let skillId: string

      const { data: existingSkill } = await ctx.supabase
        .from('skills')
        .select('id')
        .eq('name', input.skillName)
        .single()

      if (existingSkill) {
        skillId = existingSkill.id
      } else {
        const { data: newSkill, error: createError } = await ctx.supabase
          .from('skills')
          .insert({ name: input.skillName })
          .select()
          .single()

        if (createError || !newSkill) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create skill',
          })
        }

        skillId = newSkill.id
      }

      // Add to talent_skills (ignore if already exists)
      const { error: linkError } = await ctx.supabase
        .from('talent_skills')
        .insert({
          talent_profile_id: profile.id,
          skill_id: skillId,
        })

      // Ignore duplicate key errors
      if (linkError && !linkError.message.includes('duplicate')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add skill',
        })
      }

      return { success: true, skillId }
    }),

  /**
   * Remove a skill from own profile
   */
  removeSkill: talentProcedure
    .input(z.object({ skillId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get talent profile ID
      const { data: profile } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }

      const { error } = await ctx.supabase
        .from('talent_skills')
        .delete()
        .eq('talent_profile_id', profile.id)
        .eq('skill_id', input.skillId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove skill',
        })
      }

      return { success: true }
    }),

  /**
   * Get own past roles
   */
  getMyPastRoles: talentProcedure.query(async ({ ctx }) => {
    // Get talent profile ID
    const { data: profile } = await ctx.supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', ctx.user.id)
      .single()

    if (!profile) {
      return []
    }

    const { data: pastRoles, error } = await ctx.supabase
      .from('past_roles')
      .select('*')
      .eq('talent_profile_id', profile.id)
      .order('start_date', { ascending: false })

    if (error) {
      return []
    }

    return pastRoles || []
  }),

  /**
   * Add a past role
   */
  addPastRole: talentProcedure
    .input(
      z.object({
        company_name: z.string().min(1),
        title: z.string().min(1),
        start_date: z.string(), // ISO date string
        end_date: z.string().nullable(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get talent profile ID
      const { data: profile } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }

      const { data, error } = await ctx.supabase
        .from('past_roles')
        .insert({
          talent_profile_id: profile.id,
          company_name: input.company_name,
          title: input.title,
          start_date: input.start_date,
          end_date: input.end_date,
          description: input.description || null,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add past role',
        })
      }

      return data
    }),

  /**
   * Update a past role
   */
  updatePastRole: talentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        company_name: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        start_date: z.string().optional(),
        end_date: z.string().nullable().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get talent profile ID
      const { data: profile } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }

      const { id, ...updateData } = input

      const { data, error } = await ctx.supabase
        .from('past_roles')
        .update(updateData as any)
        .eq('id', id)
        .eq('talent_profile_id', profile.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update past role',
        })
      }

      return data
    }),

  /**
   * Delete a past role
   */
  deletePastRole: talentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get talent profile ID
      const { data: profile } = await ctx.supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single()

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }

      const { error } = await ctx.supabase
        .from('past_roles')
        .delete()
        .eq('id', input.id)
        .eq('talent_profile_id', profile.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete past role',
        })
      }

      return { success: true }
    }),
})
