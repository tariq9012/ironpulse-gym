import { NextResponse } from 'next/server'
import { and, asc, eq, gte, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bookings, classTrainers, classes, members, trainers } from '@/lib/db/schema'
import { getTrainer } from '@/lib/trainer-auth'

export async function GET() {
  const trainer = await getTrainer()
  if (!trainer) return NextResponse.json({ success: false, message: 'Trainer access required' }, { status: 403 })
  const assignments = await db.select({ classId: classTrainers.classId }).from(classTrainers).where(eq(classTrainers.trainerId, trainer.id))
  const classIds = assignments.map((item) => item.classId)
  const ownedClasses = classIds.length ? await db.select().from(classes).where(inArray(classes.id, classIds)).orderBy(asc(classes.startsAt)) : []
  const upcoming = ownedClasses.filter((item) => item.startsAt >= new Date())
  const roster = classIds.length ? await db.select({ userId: bookings.userId, classId: bookings.classId, name: members.fullName, email: members.email }).from(bookings).leftJoin(members, eq(members.userId, bookings.userId)).where(and(inArray(bookings.classId, classIds), eq(bookings.status, 'booked'))) : []
  const memberMap = new Map(roster.map((item) => [item.userId, item]))
  return NextResponse.json({ success: true, data: { trainer, classes: upcoming, roster, stats: { classes: upcoming.length, members: memberMap.size, bookings: roster.length } } })
}
