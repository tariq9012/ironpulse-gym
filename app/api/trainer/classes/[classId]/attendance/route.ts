import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance, bookings, classTrainers, trainers } from '@/lib/db/schema'

export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const { classId } = await params
  const trainer = await db.select({ id: trainers.id }).from(trainers).where(and(eq(trainers.userId, session.user.id), eq(trainers.active, true))).limit(1)
  if (!trainer[0]) return NextResponse.json({ message: 'Trainer access required.' }, { status: 403 })
  const assigned = await db.select({ classId: classTrainers.classId }).from(classTrainers).where(and(eq(classTrainers.classId, classId), eq(classTrainers.trainerId, trainer[0].id))).limit(1)
  if (!assigned[0]) return NextResponse.json({ message: 'Class is not assigned to this trainer.' }, { status: 403 })
  const body = await request.json().catch(() => null)
  if (!body?.bookingId || !['present', 'absent', 'late', 'excused'].includes(body.status)) return NextResponse.json({ message: 'Invalid attendance payload.' }, { status: 400 })
  const booking = await db.select({ id: bookings.id, userId: bookings.userId }).from(bookings).where(and(eq(bookings.id, body.bookingId), eq(bookings.classId, classId), eq(bookings.status, 'booked'))).limit(1)
  if (!booking[0]) return NextResponse.json({ message: 'Active booking not found.' }, { status: 404 })
  const result = await db.insert(attendance).values({ bookingId: booking[0].id, classId, memberId: booking[0].userId, markedBy: session.user.id, status: body.status, note: typeof body.note === 'string' ? body.note.slice(0, 500) : null }).onConflictDoUpdate({ target: attendance.bookingId, set: { status: body.status, note: typeof body.note === 'string' ? body.note.slice(0, 500) : null, markedBy: session.user.id, markedAt: new Date() } }).returning()
  return NextResponse.json(result[0])
}
