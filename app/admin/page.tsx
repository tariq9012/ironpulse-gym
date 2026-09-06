import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { admins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AdminPortal } from '@/components/admin-portal'

export default async function AdminPage(){const session=await auth.api.getSession({headers:await headers()});if(!session?.user)redirect('/sign-in');const admin=await db.select({id:admins.id}).from(admins).where(eq(admins.userId,session.user.id)).limit(1);if(!admin[0])redirect('/member/dashboard');return <AdminPortal/>}
