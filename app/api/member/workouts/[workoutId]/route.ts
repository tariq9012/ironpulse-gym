import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, asc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workouts, workoutExercises, workoutSets } from '@/lib/db/schema'

type Context = { params: Promise<{ workoutId: string }> }

export async function GET(_: Request, { params }: Context) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { workoutId } = await params
  const workout = await db.select().from(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.userId, session.user.id))).limit(1)
  if (!workout[0]) return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
  const exercises = await db.select().from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).orderBy(asc(workoutExercises.sortOrder))
  const sets = await db.select().from(workoutSets).where(and(eq(workoutSets.workoutId, workoutId), eq(workoutSets.userId, session.user.id))).orderBy(asc(workoutSets.setNumber))
  return NextResponse.json({ success: true, data: { ...workout[0], exercises: exercises.map(exercise => ({ ...exercise, sets: sets.filter(set => set.exerciseId === exercise.id) })) } })
}
