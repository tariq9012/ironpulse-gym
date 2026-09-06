import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, members } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    await requireAdmin()
    const rows = await db.select({ id: payments.id, memberName: members.fullName, memberEmail: members.email, amountCents: payments.amountCents, status: payments.status, paidAt: payments.paidAt }).from(payments).leftJoin(members, eq(members.userId, payments.userId)).orderBy(desc(payments.paidAt)).limit(100)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ success: false, message: status === 403 ? 'Admin access required.' : 'Authentication required.' }, { status })
  }
}
