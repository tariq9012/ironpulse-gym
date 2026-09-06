import { NextResponse } from 'next/server'
import { and, asc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversations, messages, trainers } from '@/lib/db/schema'

export async function GET(_: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const { conversationId } = await params
  const owned = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.memberId, session.user.id))).limit(1)
  if (!owned[0]) return NextResponse.json({ message: 'Conversation not found.' }, { status: 404 })
  const rows = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const { conversationId } = await params
  const owned = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.memberId, session.user.id))).limit(1)
  const body = await request.json().catch(() => null)
  if (!owned[0] || typeof body?.body !== 'string' || !body.body.trim() || body.body.length > 2000) return NextResponse.json({ message: 'Invalid conversation or message.' }, { status: 400 })
  const result = await db.insert(messages).values({ conversationId, senderUserId: session.user.id, body: body.body.trim() }).returning()
  return NextResponse.json(result[0], { status: 201 })
}
