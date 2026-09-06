import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { goals } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const numberValue = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value) && value >= 0 ? value : null

async function owner(goalId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { userId: session.user.id, goalId }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params
  const access = await owner(goalId)
  if ('response' in access) return access.response
  try {
    const body = await request.json()
    const updates: { title?: string; unit?: string; target?: number; current?: number } = {}
    if (body.title !== undefined) { const title = clean(body.title, 100); if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 }); updates.title = title }
    if (body.unit !== undefined) { const unit = clean(body.unit, 24); if (!unit) return NextResponse.json({ error: 'Unit is required.' }, { status: 400 }); updates.unit = unit }
    if (body.target !== undefined) { const target = numberValue(body.target); if (target === null || target <= 0) return NextResponse.json({ error: 'Target must be positive.' }, { status: 400 }); updates.target = target }
    if (body.current !== undefined) { const current = numberValue(body.current); if (current === null) return NextResponse.json({ error: 'Current value is invalid.' }, { status: 400 }); updates.current = current }
    if (!Object.keys(updates).length) return NextResponse.json({ error: 'No changes provided.' }, { status: 400 })
    const [updated] = await db.update(goals).set(updates).where(and(eq(goals.id, goalId), eq(goals.userId, access.userId))).returning()
    if (!updated) return NextResponse.json({ error: 'Goal not found.' }, { status: 404 })
    return NextResponse.json({ success: true, data: updated })
  } catch { return NextResponse.json({ error: 'Unable to update goal.' }, { status: 400 }) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params
  const access = await owner(goalId)
  if ('response' in access) return access.response
  const [deleted] = await db.delete(goals).where(and(eq(goals.id, goalId), eq(goals.userId, access.userId))).returning({ id: goals.id })
  if (!deleted) return NextResponse.json({ error: 'Goal not found.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
