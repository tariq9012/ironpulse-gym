import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bookings, classTrainers, classes, members } from '@/lib/db/schema'
import { getTrainer } from '@/lib/trainer-auth'

type Context = { params: Promise<{ classId: string }> }

export async function GET(_: Request, { params }: Context) {
  const trainer = await getTrainer()
  if (!trainer) return NextResponse.json({ success: false, message: 'Trainer access required' }, { status: 403 })
  const { classId } = await params
  const owned = await db.select({ id: classes.id, title: classes.title, startsAt: classes.startsAt, room: classes.room }).from(classTrainers).innerJoin(classes, eq(classes.id, classTrainers.classId)).where(and(eq(classTrainers.trainerId, trainer.id), eq(classes.id, classId))).limit(1)
  if (!owned[0]) return NextResponse.json({ success: false, message: 'Class not assigned to this trainer' }, { status: 404 })
  const roster = await db.select({ bookingId: bookings.id, userId: bookings.userId, name: members.fullName, email: members.email, bookedAt: bookings.bookedAt }).from(bookings).leftJoin(members, eq(members.userId, bookings.userId)).where(and(eq(bookings.classId, classId), eq(bookings.status, 'booked')))
  return NextResponse.json({ success: true, data: { class: owned[0], roster } })
}
