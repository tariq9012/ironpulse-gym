import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workouts, workoutExercises, workoutSets } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(workouts).where(eq(workouts.userId, session.user.id)).orderBy(desc(workouts.createdAt))
  const result = await Promise.all(rows.map(async workout => {
    const exerciseRows = await db.select().from(workoutExercises).where(eq(workoutExercises.workoutId, workout.id)).orderBy(workoutExercises.sortOrder)
    const sets = await db.select().from(workoutSets).where(eq(workoutSets.workoutId, workout.id))
    const exercises = exerciseRows.map(exercise => ({ ...exercise, targetSets: exercise.sets, sets: sets.filter(set => set.exerciseId === exercise.id) }))
    return { ...workout, exercises, completedSets: sets.filter(set => set.completed).length, totalSets: sets.length || exerciseRows.reduce((total, exercise) => total + exercise.sets, 0) }
  }))
  return NextResponse.json({ success: true, data: result })
}
