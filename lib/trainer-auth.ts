import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { trainers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getTrainer() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const rows = await db.select().from(trainers).where(eq(trainers.userId, session.user.id)).limit(1)
  const trainer = rows[0]
  return trainer?.active ? { ...trainer, sessionUserId: session.user.id } : null
}

export async function requireTrainer() {
  const trainer = await getTrainer()
  if (!trainer) throw new Error('Trainer access required')
  return trainer
}
