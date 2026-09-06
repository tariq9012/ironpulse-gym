import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings, classes } from '@/lib/db/schema'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(_request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ success: false, message: 'Please sign in to book a class.' }, { status: 401 })
  const { classId } = await params
  if (!uuidPattern.test(classId)) return NextResponse.json({ success: false, message: 'Invalid class.' }, { status: 400 })

  try {
    const result = await db.transaction(async (tx) => {
      const classRows = await tx.execute(sql`SELECT id, title, starts_at, capacity FROM classes WHERE id = ${classId} FOR UPDATE`)
      const classItem = classRows.rows[0] as { id: string; title: string; starts_at: string; capacity: number } | undefined
      if (!classItem) return { error: 'This class is no longer available.', status: 404 as const }
      if (new Date(classItem.starts_at).getTime() <= Date.now()) return { error: 'This class has already started.', status: 409 as const }

      const existingRows = await tx.execute(sql`SELECT id, status FROM bookings WHERE user_id = ${session.user.id} AND class_id = ${classId} ORDER BY booked_at DESC LIMIT 1`)
      const existing = existingRows.rows[0] as { id: string; status: string } | undefined
      if (existing?.status === 'booked') return { error: 'This class is already booked.', status: 409 as const }

      const countRows = await tx.execute(sql`SELECT COUNT(*)::int AS count FROM bookings WHERE class_id = ${classId} AND status = 'booked'`)
      const bookedCount = Number((countRows.rows[0] as { count: number }).count)
      if (bookedCount >= Number(classItem.capacity)) return { error: 'This class is full.', status: 409 as const }

      const inserted = await tx.insert(bookings).values({ userId: session.user.id, classId, status: 'booked' }).returning({ id: bookings.id, classId: bookings.classId, status: bookings.status, bookedAt: bookings.bookedAt })
      return { booking: inserted[0] }
    })
    if ('error' in result) return NextResponse.json({ success: false, message: result.error }, { status: result.status })
    return NextResponse.json({ success: true, data: { booking: result.booking }, message: 'Class booked successfully.' }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to complete your booking. Please try again.' }, { status: 500 })
  }
}
