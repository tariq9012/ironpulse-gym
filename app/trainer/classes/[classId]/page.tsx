import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { TrainerClassRoster } from '@/components/trainer-class-roster'

type Props = { params: Promise<{ classId: string }> }

export default async function TrainerClassPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const { classId } = await params
  return <TrainerClassRoster classId={classId} />
}
