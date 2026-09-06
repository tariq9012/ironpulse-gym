import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mealLogs } from '@/lib/db/schema'

const getUser = async () => (await auth.api.getSession({ headers: await headers() }))?.user
const mealTypes = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snack'])
const validNumber = (value: unknown, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max

export async function PATCH(request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { entryId } = await params; const body = await request.json().catch(() => null)
  if (typeof body?.mealName !== 'string' || !body.mealName.trim() || !mealTypes.has(body.mealType) || !validNumber(body.calories, 10000) || !validNumber(body.proteinG, 1000) || !validNumber(body.carbsG, 1000) || !validNumber(body.fatG, 1000)) return NextResponse.json({ error: 'Invalid meal entry.' }, { status: 400 })
  const [entry] = await db.update(mealLogs).set({ mealType: body.mealType, mealName: body.mealName.trim(), calories: body.calories, proteinG: String(body.proteinG), carbsG: String(body.carbsG), fatG: String(body.fatG), notes: typeof body.notes === 'string' ? body.notes.trim() || null : null, completed: Boolean(body.completed) }).where(and(eq(mealLogs.id, entryId), eq(mealLogs.userId, user.id))).returning()
  if (!entry) return NextResponse.json({ error: 'Meal not found.' }, { status: 404 })
  return NextResponse.json({ success: true, data: entry })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const user = await getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { entryId } = await params
  const [entry] = await db.delete(mealLogs).where(and(eq(mealLogs.id, entryId), eq(mealLogs.userId, user.id))).returning({ id: mealLogs.id })
  if (!entry) return NextResponse.json({ error: 'Meal not found.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
