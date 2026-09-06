import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookings, classes, members, payments, trainers } from '@/lib/db/schema'
import { count, eq, gte, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    const { admin } = await requireAdmin()
    const [memberCount, trainerCount, upcomingCount, revenue] = await Promise.all([
      db.select({ value: count() }).from(members),
      db.select({ value: count() }).from(trainers).where(eq(trainers.active, true)),
      db.select({ value: count() }).from(classes).where(gte(classes.startsAt, new Date())),
      db.select({ value: sql<number>`coalesce(sum(${payments.amountCents}), 0)` }).from(payments).where(eq(payments.status, 'paid')),
    ])
    return NextResponse.json({ success: true, data: { admin, stats: { members: Number(memberCount[0]?.value ?? 0), trainers: Number(trainerCount[0]?.value ?? 0), upcomingClasses: Number(upcomingCount[0]?.value ?? 0), revenueCents: Number(revenue[0]?.value ?? 0) } } })
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ success: false, message: status === 403 ? 'Admin access required.' : 'Authentication required.' }, { status })
  }
}
