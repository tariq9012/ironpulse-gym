import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { trainers } from '@/lib/db/schema'
import { TrainerDashboard } from '@/components/trainer-dashboard'

export default async function TrainerPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const [trainer] = await db.select({ id: trainers.id, active: trainers.active }).from(trainers).where(eq(trainers.userId, session.user.id)).limit(1)
  if (!trainer?.active) redirect('/member/dashboard')
  return <TrainerDashboard />
}
