import { createTRPCRouter } from './trpc'
import { adminRouter } from './routers/admin'
import { talentRouter } from './routers/talent'
import { founderRouter } from './routers/founder'
import { publicRouter } from './routers/public'
import { commonRouter } from './routers/common'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  talent: talentRouter,
  founder: founderRouter,
  public: publicRouter,
  common: commonRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
