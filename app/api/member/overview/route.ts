import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { members, goals, progressEntries, notifications, bookings, classes, workouts, payments, mealLogs } from '@/lib/db/schema'
import { and, desc, eq, gt } from 'drizzle-orm'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const now = new Date()
  const [memberRows, memberGoals, progressRows, notificationRows, bookingRows, workoutRows, paymentRows, mealRows] = await Promise.all([
    db.select().from(members).where(eq(members.userId, userId)).limit(1),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(progressEntries).where(eq(progressEntries.userId, userId)).orderBy(progressEntries.recordedAt).limit(12),
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(8),
    db.select({ booking: bookings, class: classes }).from(bookings).innerJoin(classes, eq(bookings.classId, classes.id)).where(and(eq(bookings.userId, userId), eq(bookings.status, 'booked'), gt(classes.startsAt, now))).orderBy(classes.startsAt).limit(5),
    db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.createdAt)).limit(3),
    db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.paidAt)).limit(1),
    db.select().from(mealLogs).where(eq(mealLogs.userId, userId)).orderBy(desc(mealLogs.mealDate)).limit(20),
  ])
  const latest = progressRows.at(-1) ?? null
  const previous = progressRows.at(-2) ?? null
  const membershipEnd = memberRows[0]?.membershipEnd ?? null
  const remainingDays = membershipEnd ? Math.max(0, Math.ceil((membershipEnd.getTime() - now.getTime()) / 86400000)) : null
  const bookedClasses = bookingRows.map(({ booking, class: classItem }) => ({ ...classItem, bookingStatus: booking.status, bookingId: booking.id }))
  return NextResponse.json({ success: true, data: { member: memberRows[0] ?? null, membership: { plan: memberRows[0]?.membershipPlan ?? null, status: memberRows[0]?.membershipStatus ?? null, expiryDate: membershipEnd, remainingDays }, upcomingClasses: bookedClasses, recentBookings: bookedClasses, progress: { entries: progressRows, latest, change: latest && previous ? Number(latest.weightKg) - Number(previous.weightKg) : null }, goals: memberGoals, notifications: notificationRows, unreadNotificationCount: notificationRows.filter((item) => !item.read).length, workoutSummary: { recent: workoutRows, completed: workoutRows.filter((item) => item.status === 'completed').length }, nutritionSummary: { recent: mealRows, completed: mealRows.filter((item) => item.completed).length }, paymentSummary: paymentRows[0] ?? null } })
}
