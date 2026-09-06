'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function SignUpPage() {
  const router = useRouter(); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(''); const form = new FormData(event.currentTarget); const result = await authClient.signUp.email({ name: String(form.get('name')), email: String(form.get('email')), password: String(form.get('password')) }); if (result.error) setError(result.error.message || 'Unable to create your account.'); else { router.push('/member/dashboard'); router.refresh() }; setPending(false) }
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12"><div className="w-full max-w-md border border-white/10 bg-surface p-8"><Link href="/" className="font-display text-xl font-black">IRON<span className="text-accent">PULSE</span></Link><p className="eyebrow mt-12">Start your membership</p><h1 className="mt-4 font-display text-5xl font-black uppercase leading-none">Create account</h1><form onSubmit={submit} className="mt-8 grid gap-4"><label className="grid gap-2 text-sm">Full name<input name="name" required className="border border-white/15 bg-background px-4 py-3" /></label><label className="grid gap-2 text-sm">Email<input name="email" type="email" required className="border border-white/15 bg-background px-4 py-3" /></label><label className="grid gap-2 text-sm">Password<input name="password" type="password" minLength={8} required className="border border-white/15 bg-background px-4 py-3" /></label>{error && <p className="text-sm text-accent">{error}</p>}<button disabled={pending} className="bg-accent px-5 py-4 text-xs font-bold uppercase tracking-[.15em] text-background">{pending ? 'Creating…' : 'Create account'}</button></form><p className="mt-6 text-sm text-muted-foreground">Already a member? <Link className="text-accent" href="/sign-in">Sign in</Link></p></div></main>
}
