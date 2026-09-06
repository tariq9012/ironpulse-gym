import { NextResponse } from 'next/server'
import { and, asc, desc, eq, or } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversations, messages, trainers, classTrainers, classes, bookings } from '@/lib/db/schema'

async function sessionUser() { return auth.api.getSession({ headers: await headers() }) }

export async function GET() {
  const session = await sessionUser()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const rows = await db.select({ id: conversations.id, trainerId: conversations.trainerId, createdAt: conversations.createdAt, lastMessageAt: conversations.lastMessageAt, trainerName: trainers.displayName }).from(conversations).innerJoin(trainers, eq(conversations.trainerId, trainers.id)).where(eq(conversations.memberId, session.user.id)).orderBy(desc(conversations.lastMessageAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await sessionUser()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.trainerId || typeof body.body !== 'string' || body.body.trim().length < 1 || body.body.length > 2000) return NextResponse.json({ message: 'Message and trainer are required.' }, { status: 400 })
  const relationship = await db.select({ trainerId: trainers.id }).from(bookings).innerJoin(classes, eq(bookings.classId, classes.id)).innerJoin(classTrainers, eq(classTrainers.classId, classes.id)).innerJoin(trainers, eq(classTrainers.trainerId, trainers.id)).where(and(eq(bookings.userId, session.user.id), eq(bookings.status, 'booked'), eq(trainers.id, body.trainerId))).limit(1)
  if (!relationship[0]) return NextResponse.json({ message: 'You can only message an assigned trainer.' }, { status: 403 })
  const conversation = await db.insert(conversations).values({ memberId: session.user.id, trainerId: body.trainerId, lastMessageAt: new Date() }).onConflictDoUpdate({ target: [conversations.memberId, conversations.trainerId], set: { lastMessageAt: new Date() } }).returning({ id: conversations.id })
  const message = await db.insert(messages).values({ conversationId: conversation[0].id, senderUserId: session.user.id, body: body.body.trim() }).returning()
  return NextResponse.json({ conversationId: conversation[0].id, message: message[0] }, { status: 201 })
}
