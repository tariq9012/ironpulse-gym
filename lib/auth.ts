import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  emailAndPassword: { enabled: true, autoSignIn: true },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(members).values({
            userId: user.id,
            fullName: user.name || 'Member',
            email: user.email,
          })
        },
      },
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
    ...(process.env.NODE_ENV === 'production' ? [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '', process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ''].filter(Boolean) : []),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
