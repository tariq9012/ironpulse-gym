import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings, classes } from '@/lib/db/schema'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function DELETE(_request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ success: false, message: 'Please sign in to manage bookings.' }, { status: 401 })
  const { bookingId } = await params
  if (!uuidPattern.test(bookingId)) return NextResponse.json({ success: false, message: 'Invalid booking.' }, { status: 400 })
  try {
    const owned = await db.select({ id: bookings.id, status: bookings.status, classDate: classes.startsAt }).from(bookings).innerJoin(classes, eq(bookings.classId, classes.id)).where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id))).limit(1)
    if (!owned[0]) return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 })
    if (owned[0].status === 'cancelled') return NextResponse.json({ success: false, message: 'This booking is already cancelled.' }, { status: 409 })
    if (new Date(owned[0].classDate).getTime() <= Date.now()) return NextResponse.json({ success: false, message: 'Past classes cannot be cancelled.' }, { status: 409 })
    const updated = await db.update(bookings).set({ status: 'cancelled', cancelledAt: new Date() }).where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id), eq(bookings.status, 'booked'))).returning({ id: bookings.id, classId: bookings.classId, status: bookings.status, cancelledAt: bookings.cancelledAt })
    if (!updated[0]) return NextResponse.json({ success: false, message: 'This booking is no longer active.' }, { status: 409 })
    return NextResponse.json({ success: true, data: { booking: updated[0] }, message: 'Booking cancelled.' })
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to cancel your booking. Please try again.' }, { status: 500 })
  }
}
