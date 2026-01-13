import { createTRPCRouter, protectedProcedure } from '../trpc'

export const commonRouter = createTRPCRouter({
  /**
   * Get current user info with role
   */
  getMyUser: protectedProcedure.query(async ({ ctx }) => {
    const { data: user, error } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', ctx.user.id)
      .single()

    if (error || !user) {
      return null
    }

    return user
  }),

  /**
   * Get all skills for autocomplete
   */
  getAllSkills: protectedProcedure.query(async ({ ctx }) => {
    const { data: skills, error } = await ctx.supabase
      .from('skills')
      .select('*')
      .order('name')

    if (error) {
      return []
    }

    return skills || []
  }),

  /**
   * Get all companies (for founder profile creation, reference)
   */
  getAllCompanies: protectedProcedure.query(async ({ ctx }) => {
    const { data: companies, error } = await ctx.supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) {
      return []
    }

    return companies || []
  }),
})
