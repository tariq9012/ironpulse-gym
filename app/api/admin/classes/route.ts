import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { classes, bookings } from '@/lib/db/schema'
import { asc, count, gte, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    await requireAdmin()
    const rows = await db.select({ id: classes.id, title: classes.title, category: classes.category, coach: classes.coach, startsAt: classes.startsAt, capacity: classes.capacity, room: classes.room, bookedCount: count(bookings.id) }).from(classes).leftJoin(bookings, sql`${bookings.classId} = ${classes.id} and ${bookings.status} = 'booked'`).where(gte(classes.startsAt, new Date())).groupBy(classes.id).orderBy(asc(classes.startsAt)).limit(100)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ success: false, message: status === 403 ? 'Admin access required.' : 'Authentication required.' }, { status })
  }
}
