import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { admins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const rows = await db.select({ id: admins.id, displayName: admins.displayName }).from(admins).where(eq(admins.userId, session.user.id)).limit(1)
  if (!rows[0]) throw new Error('Forbidden')
  return { session, admin: rows[0] }
}
