import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { goals } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const numberValue = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value) && value >= 0 ? value : null

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(goals).where(eq(goals.userId, session.user.id)).orderBy(asc(goals.id))
  const active = rows.filter((goal) => goal.current < goal.target)
  const completed = rows.filter((goal) => goal.current >= goal.target)
  return NextResponse.json({ success: true, data: { goals: rows, summary: { active: active.length, completed: completed.length, total: rows.length } } })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const title = clean(body.title, 100)
    const unit = clean(body.unit, 24)
    const target = numberValue(body.target)
    const current = body.current === undefined ? 0 : numberValue(body.current)
    if (!title || !unit || target === null || target <= 0 || current === null) return NextResponse.json({ error: 'Enter a title, unit, positive target, and valid current value.' }, { status: 400 })
    const [created] = await db.insert(goals).values({ userId: session.user.id, title, target, current, unit }).returning()
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Unable to create goal.' }, { status: 400 }) }
}
