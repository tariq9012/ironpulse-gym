import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'

async function userId() { const session = await auth.api.getSession({ headers: await headers() }); return session?.user?.id ?? null }
export async function PATCH(request: Request) {
  const id = await userId(); if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (typeof body?.notificationId !== 'string') return NextResponse.json({ error: 'Invalid notification.' }, { status: 400 })
  const updated = await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, body.notificationId), eq(notifications.userId, id))).returning()
  if (!updated.length) return NextResponse.json({ error: 'Notification not found.' }, { status: 404 })
  return NextResponse.json({ success: true, data: updated[0] })
}

export async function PUT() {
  const id = await userId(); if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, id))
  return NextResponse.json({ success: true })
}
