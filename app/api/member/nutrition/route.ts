import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mealLogs } from '@/lib/db/schema'

const mealTypes = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snack'])
const getUser = async () => (await auth.api.getSession({ headers: await headers() }))?.user
const dayBounds = (date: string) => { const start = new Date(`${date}T00:00:00.000Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1); return { start, end } }
const validNumber = (value: unknown, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max

export async function GET(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const date = new URL(request.url).searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const { start, end } = dayBounds(date)
  const entries = await db.select().from(mealLogs).where(and(eq(mealLogs.userId, user.id), gte(mealLogs.mealDate, start), lt(mealLogs.mealDate, end))).orderBy(asc(mealLogs.mealDate))
  const totals = entries.reduce((sum, meal) => ({ calories: sum.calories + meal.calories, proteinG: sum.proteinG + Number(meal.proteinG), carbsG: sum.carbsG + Number(meal.carbsG), fatG: sum.fatG + Number(meal.fatG), completed: sum.completed + (meal.completed ? 1 : 0) }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, completed: 0 })
  return NextResponse.json({ success: true, data: { date, entries, totals } })
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const mealDate = typeof body?.mealDate === 'string' ? new Date(body.mealDate) : new Date()
  if (Number.isNaN(mealDate.getTime()) || mealDate.getTime() > Date.now() || typeof body?.mealName !== 'string' || !body.mealName.trim() || !mealTypes.has(body.mealType) || !validNumber(body.calories, 10000) || !validNumber(body.proteinG, 1000) || !validNumber(body.carbsG, 1000) || !validNumber(body.fatG, 1000)) return NextResponse.json({ error: 'Invalid meal entry.' }, { status: 400 })
  const [entry] = await db.insert(mealLogs).values({ userId: user.id, mealDate, mealType: body.mealType, mealName: body.mealName.trim(), calories: body.calories, proteinG: String(body.proteinG), carbsG: String(body.carbsG), fatG: String(body.fatG), notes: typeof body.notes === 'string' ? body.notes.trim() || null : null, completed: Boolean(body.completed) }).returning()
  return NextResponse.json({ success: true, data: entry }, { status: 201 })
}
