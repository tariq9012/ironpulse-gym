import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { trainers } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    await requireAdmin()
    const rows = await db.select({ id: trainers.id, userId: trainers.userId, displayName: trainers.displayName, specialty: trainers.specialty, active: trainers.active, createdAt: trainers.createdAt }).from(trainers).orderBy(asc(trainers.displayName))
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ success: false, message: status === 403 ? 'Admin access required.' : 'Authentication required.' }, { status })
  }
}
