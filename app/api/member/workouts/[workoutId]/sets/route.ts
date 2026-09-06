import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workoutExercises, workoutSets, workouts } from '@/lib/db/schema'

type Context = { params: Promise<{ workoutId: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { workoutId } = await params
  const body = await request.json().catch(() => null)
  const exerciseId = typeof body?.exerciseId === 'string' ? body.exerciseId : ''
  const setNumber = Number(body?.setNumber)
  const reps = body?.reps == null ? null : Number(body.reps)
  const weightKg = body?.weightKg == null ? null : Number(body.weightKg)
  const completed = Boolean(body?.completed)
  if (!exerciseId || !Number.isInteger(setNumber) || setNumber < 1 || (reps !== null && (!Number.isInteger(reps) || reps < 0)) || (weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0))) return NextResponse.json({ error: 'Invalid set data' }, { status: 400 })
  const ownedWorkout = await db.select({ id: workouts.id }).from(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.userId, session.user.id))).limit(1)
  const ownedExercise = await db.select({ id: workoutExercises.id }).from(workoutExercises).where(and(eq(workoutExercises.id, exerciseId), eq(workoutExercises.workoutId, workoutId))).limit(1)
  if (!ownedWorkout[0] || !ownedExercise[0]) return NextResponse.json({ error: 'Workout set not found' }, { status: 404 })
  const values = { workoutId, exerciseId, userId: session.user.id, setNumber, reps, weightKg: weightKg === null ? null : String(weightKg), completed, completedAt: completed ? new Date() : null }
  const existing = await db.select({ id: workoutSets.id }).from(workoutSets).where(and(eq(workoutSets.workoutId, workoutId), eq(workoutSets.exerciseId, exerciseId), eq(workoutSets.userId, session.user.id), eq(workoutSets.setNumber, setNumber))).limit(1)
  const updated = existing[0] ? await db.update(workoutSets).set(values).where(eq(workoutSets.id, existing[0].id)).returning() : await db.insert(workoutSets).values(values).returning()
  return NextResponse.json({ success: true, data: updated[0] })
}
