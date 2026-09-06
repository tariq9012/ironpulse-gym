import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { members, notifications, payments } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const [memberRows, paymentRows, notificationRows] = await Promise.all([
    db.select().from(members).where(eq(members.userId, userId)).limit(1),
    db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.paidAt)).limit(20),
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50),
  ])
  return NextResponse.json({ success: true, data: { member: memberRows[0] ?? null, payments: paymentRows, notifications: notificationRows, unreadCount: notificationRows.filter((item) => !item.read).length } })
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  if (fullName.length < 2 || fullName.length > 100 || phone.length > 30) return NextResponse.json({ error: 'Invalid profile details.' }, { status: 400 })
  const updated = await db.update(members).set({ fullName, phone: phone || null }).where(eq(members.userId, session.user.id)).returning()
  return NextResponse.json({ success: true, data: updated[0] ?? null })
}
