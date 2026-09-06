import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, asc, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings, classes } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ success: false, message: 'Please sign in to view bookings.' }, { status: 401 })
  try {
    const rows = await db.select({ bookingId: bookings.id, bookingStatus: bookings.status, bookedAt: bookings.bookedAt, cancelledAt: bookings.cancelledAt, classId: classes.id, classTitle: classes.title, category: classes.category, trainer: classes.coach, classDate: classes.startsAt, durationMinutes: classes.durationMinutes, capacity: classes.capacity, room: classes.room }).from(bookings).innerJoin(classes, eq(bookings.classId, classes.id)).where(eq(bookings.userId, session.user.id)).orderBy(asc(classes.startsAt), desc(bookings.bookedAt))
    const now = Date.now()
    const data = rows.map((row) => ({ ...row, state: row.bookingStatus === 'cancelled' ? 'cancelled' : new Date(row.classDate).getTime() > now ? 'upcoming' : 'completed' }))
    return NextResponse.json({ success: true, data: { bookings: data } })
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to load your bookings.' }, { status: 500 })
  }
}
