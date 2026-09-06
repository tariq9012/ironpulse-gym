import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { asc, ilike, or } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const query = new URL(request.url).searchParams.get('q')?.trim()
    const rows = await db.select({ id: members.id, userId: members.userId, fullName: members.fullName, email: members.email, membershipPlan: members.membershipPlan, membershipStatus: members.membershipStatus, membershipEnd: members.membershipEnd }).from(members).where(query ? or(ilike(members.fullName, `%${query}%`), ilike(members.email, `%${query}%`)) : undefined).orderBy(asc(members.fullName)).limit(100)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ success: false, message: status === 403 ? 'Admin access required.' : 'Authentication required.' }, { status })
  }
}
