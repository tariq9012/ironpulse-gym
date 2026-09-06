import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workouts } from '@/lib/db/schema'

type Context = { params: Promise<{ workoutId: string }> }

export async function POST(_: Request, { params }: Context) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { workoutId } = await params
  const workout = await db.update(workouts).set({ status: 'completed', completedAt: new Date() }).where(and(eq(workouts.id, workoutId), eq(workouts.userId, session.user.id))).returning()
  if (!workout[0]) return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: workout[0] })
}
