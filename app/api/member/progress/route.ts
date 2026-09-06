import { NextResponse } from 'next/server'
import { and, asc, desc, eq } from 'drizzle-orm'
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

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entries = await db.select().from(progressEntries).where(eq(progressEntries.userId, userId)).orderBy(asc(progressEntries.recordedAt))
  const latest = entries.at(-1) ?? null
  const previous = entries.at(-2) ?? null
  return NextResponse.json({ success: true, data: { entries, latest, previous, change: latest && previous ? Number(latest.weightKg) - Number(previous.weightKg) : null } })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const parsed = parsePayload(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 422 })
  const [entry] = await db.insert(progressEntries).values({ userId, ...parsed.values }).returning()
  return NextResponse.json({ success: true, data: entry }, { status: 201 })
}
