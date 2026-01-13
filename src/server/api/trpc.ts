// @ts-nocheck
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Create tRPC context
 * This runs for every request and provides the context to all procedures
 */
export async function createTRPCContext(opts: { headers: Headers }) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch role from users table if authenticated
  let role: 'admin' | 'founder' | 'talent' | null = null
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = userData?.role as 'admin' | 'founder' | 'talent' || null
  }

  return {
    supabase,
    user,
    role,
    headers: opts.headers,
  }
}

/**
 * Initialize tRPC with context type
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Middleware to ensure user is authenticated
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // User is now non-nullable
    },
  })
})

/**
 * Middleware to ensure user is an admin
 */
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    })
  }
  return next({ ctx })
})

/**
 * Middleware to ensure user is a founder
 */
const enforceUserIsFounder = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.role !== 'founder') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Founder access required'
    })
  }
  return next({ ctx })
})

/**
 * Middleware to ensure user is talent
 */
const enforceUserIsTalent = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.role !== 'talent') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Talent access required'
    })
  }
  return next({ ctx })
})

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceUserIsAdmin)
export const founderProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceUserIsFounder)
export const talentProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceUserIsTalent)
