import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { progressEntries } from '@/lib/db/schema'

const numberValue = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null
const parsePayload = (body: Record<string, unknown>) => {
  const weightKg = numberValue(body.weightKg)
  const bodyFat = body.bodyFat === '' || body.bodyFat == null ? null : numberValue(body.bodyFat)
  const recordedAt = typeof body.recordedAt === 'string' && !Number.isNaN(new Date(body.recordedAt).getTime()) ? new Date(body.recordedAt) : null
  const notes = body.notes == null ? null : String(body.notes).trim()
  if (weightKg == null || weightKg < 20 || weightKg > 500) return { error: 'Enter a weight between 20 and 500 kg.' }
  if (bodyFat != null && (bodyFat < 1 || bodyFat > 80)) return { error: 'Body fat must be between 1% and 80%.' }
  if (!recordedAt) return { error: 'Choose a valid measurement date.' }
  if (notes && notes.length > 500) return { error: 'Notes must be 500 characters or fewer.' }
  return { values: { weightKg: weightKg.toFixed(1), bodyFat: bodyFat == null ? null : bodyFat.toFixed(1), recordedAt, notes: notes || null } }
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { entryId } = await params
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const parsed = parsePayload(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 422 })
  const [entry] = await db.update(progressEntries).set(parsed.values).where(and(eq(progressEntries.id, entryId), eq(progressEntries.userId, userId))).returning()
  if (!entry) return NextResponse.json({ error: 'Progress entry not found.' }, { status: 404 })
  return NextResponse.json({ success: true, data: entry })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { entryId } = await params
  const [entry] = await db.delete(progressEntries).where(and(eq(progressEntries.id, entryId), eq(progressEntries.userId, userId))).returning({ id: progressEntries.id })
  if (!entry) return NextResponse.json({ error: 'Progress entry not found.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
