import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { admins, trainers } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ role: null }, { status: 401 })
  const [admin] = await db.select({ id: admins.id }).from(admins).where(eq(admins.userId, session.user.id)).limit(1)
  if (admin) return NextResponse.json({ role: 'admin' })
  const [trainer] = await db.select({ id: trainers.id, active: trainers.active }).from(trainers).where(eq(trainers.userId, session.user.id)).limit(1)
  if (trainer?.active) return NextResponse.json({ role: 'trainer' })
  return NextResponse.json({ role: 'member' })
}
