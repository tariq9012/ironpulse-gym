import { NextResponse } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bookings, classTrainers, classes, members } from '@/lib/db/schema'
import { getTrainer } from '@/lib/trainer-auth'

export async function GET() {
  const trainer = await getTrainer()
  if (!trainer) return NextResponse.json({ success: false, message: 'Trainer access required' }, { status: 403 })
  const assigned = await db.select({ classId: classTrainers.classId }).from(classTrainers).where(eq(classTrainers.trainerId, trainer.id))
  const ids = assigned.map((item) => item.classId)
  if (!ids.length) return NextResponse.json({ success: true, data: [] })
  const rows = await db.select({ id: members.id, userId: members.userId, fullName: members.fullName, email: members.email, phone: members.phone, classTitle: classes.title, classId: classes.id }).from(bookings).innerJoin(classes, eq(classes.id, bookings.classId)).leftJoin(members, eq(members.userId, bookings.userId)).where(and(inArray(bookings.classId, ids), eq(bookings.status, 'booked')))
  const data = Array.from(new Map(rows.map((row) => [row.userId, row])).values())
  return NextResponse.json({ success: true, data })
}
