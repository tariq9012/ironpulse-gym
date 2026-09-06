import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, asc, eq, gt, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings, classes } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({
      id: classes.id,
      title: classes.title,
      category: classes.category,
      coach: classes.coach,
      startsAt: classes.startsAt,
      durationMinutes: classes.durationMinutes,
      capacity: classes.capacity,
      room: classes.room,
      bookedCount: sql<number>`count(${bookings.id})`,
      bookingId: bookings.id,
      bookingStatus: bookings.status,
    })
    .from(classes)
    .leftJoin(bookings, and(eq(bookings.classId, classes.id), eq(bookings.status, 'booked')))
    .where(gt(classes.startsAt, new Date()))
    .groupBy(classes.id, bookings.id, bookings.status)
    .orderBy(asc(classes.startsAt))

  const data = rows.map((row) => ({
    ...row,
    bookedCount: Number(row.bookedCount),
    spotsRemaining: Math.max(0, row.capacity - Number(row.bookedCount)),
    isBooked: Boolean(row.bookingId && row.bookingStatus === 'booked'),
  }))

  return NextResponse.json({ success: true, data })
}
