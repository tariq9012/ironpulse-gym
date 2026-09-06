import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance, bookings, classes } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const rows = await db.select({ id: attendance.id, status: attendance.status, note: attendance.note, markedAt: attendance.markedAt, title: classes.title, startsAt: classes.startsAt }).from(attendance).innerJoin(bookings, eq(attendance.bookingId, bookings.id)).innerJoin(classes, eq(attendance.classId, classes.id)).where(eq(attendance.memberId, session.user.id)).orderBy(desc(classes.startsAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.bookingId || !['present', 'absent', 'late', 'excused'].includes(body.status)) return NextResponse.json({ message: 'Invalid attendance payload.' }, { status: 400 })
  const booking = await db.select({ id: bookings.id, classId: bookings.classId, userId: bookings.userId }).from(bookings).where(and(eq(bookings.id, body.bookingId), eq(bookings.userId, session.user.id))).limit(1)
  if (!booking[0]) return NextResponse.json({ message: 'Booking not found.' }, { status: 404 })
  const result = await db.insert(attendance).values({ bookingId: booking[0].id, classId: booking[0].classId, memberId: session.user.id, markedBy: session.user.id, status: body.status, note: typeof body.note === 'string' ? body.note.slice(0, 500) : null }).onConflictDoUpdate({ target: attendance.bookingId, set: { status: body.status, note: typeof body.note === 'string' ? body.note.slice(0, 500) : null, markedAt: new Date() } }).returning()
  return NextResponse.json(result[0], { status: 201 })
}
