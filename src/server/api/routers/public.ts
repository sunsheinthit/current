// @ts-nocheck
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const publicRouter = createTRPCRouter({
  /**
   * Verify an invite token is valid
   */
  verifyInviteToken: publicProcedure
    .input(z.object({ token: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: invite, error } = await ctx.supabase
        .from('invites')
        .select('*')
        .eq('token', input.token)
        .single()

      if (error || !invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite token',
        })
      }

      // Check if already accepted
      if (invite.accepted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invite has already been used',
        })
      }

      // Check if expired
      const now = new Date()
      const expiresAt = new Date(invite.expires_at)
      if (now > expiresAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invite has expired',
        })
      }

      return {
        email: invite.email,
        valid: true,
      }
    }),

  /**
   * Accept an invite and create talent user + profile
   */
  acceptInvite: publicProcedure
    .input(
      z.object({
        token: z.string().uuid(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Verify token is valid
      const { data: invite, error: inviteError } = await ctx.supabase
        .from('invites')
        .select('*')
        .eq('token', input.token)
        .single()

      if (inviteError || !invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite token',
        })
      }

      if (invite.accepted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invite has already been used',
        })
      }

      const now = new Date()
      const expiresAt = new Date(invite.expires_at)
      if (now > expiresAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invite has expired',
        })
      }

      // 2. Create auth user via Supabase Auth
      const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
        email: invite.email,
        password: input.password,
      })

      if (authError || !authData.user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError?.message || 'Failed to create user account',
        })
      }

      const userId = authData.user.id

      // 3. Create users record with role='talent'
      const { error: userError } = await ctx.supabase
        .from('users')
        .insert({
          id: userId,
          email: invite.email,
          role: 'talent',
        })

      if (userError) {
        // Cleanup: delete the auth user if we fail to create the users record
        await ctx.supabase.auth.admin.deleteUser(userId)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user record',
        })
      }

      // 4. Create talent profile
      const { error: profileError } = await ctx.supabase
        .from('talent_profiles')
        .insert({
          user_id: userId,
          name: input.name,
          visible_to_founders: false, // Default to not visible
          availability: 'passive', // Default availability
        })

      if (profileError) {
        // Cleanup on failure
        await ctx.supabase.auth.admin.deleteUser(userId)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create talent profile',
        })
      }

      // 5. Mark invite as accepted
      await ctx.supabase
        .from('invites')
        .update({
          accepted: true,
          accepted_at: new Date().toISOString(),
        })
        .eq('token', input.token)

      return {
        success: true,
        userId,
      }
    }),
})
