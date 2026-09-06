'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Card, Title } from './member-portal'
import { authClient } from '@/lib/auth-client'
const fetcher=(url:string)=>fetch(url).then(async response=>{if(!response.ok)throw new Error('load-failed');return response.json()})
export function MemberSettingsLive(){
  const router=useRouter()
  const {data,error,isLoading,mutate}=useSWR('/api/member/account',fetcher,{revalidateOnFocus:false})
  const [currentPassword,setCurrentPassword]=useState('')
  const [newPassword,setNewPassword]=useState('')
  const [saving,setSaving]=useState(false)
  const [notice,setNotice]=useState('')
  const [signingOut,setSigningOut]=useState(false)
  if(isLoading)return <div className="animate-pulse space-y-5"><div className="h-10 w-56 bg-card"/><div className="h-64 bg-card"/></div>
  if(error)return <Card className="p-8"><h1 className="font-display text-2xl font-black uppercase">Settings unavailable.</h1><button onClick={()=>mutate()} className="mt-5 bg-accent px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-accent-foreground">Try again</button></Card>
  const member=data?.data?.member
  async function changePassword(event:React.FormEvent){
    event.preventDefault()
    setSaving(true); setNotice('')
    const {error}=await authClient.changePassword({currentPassword,newPassword,revokeOtherSessions:true})
    if(error) setNotice(error.message||'Could not update password.')
    else { setNotice('Password updated.'); setCurrentPassword(''); setNewPassword('') }
    setSaving(false)
  }
  async function handleSignOut(){
    setSigningOut(true)
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }
  return <>
    <Title eyebrow="Account" title="Settings"/>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-7">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Signed in as</p>
        <h2 className="mt-3 font-display text-2xl font-black uppercase">{member?.fullName||'Member'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{member?.email}</p>
        <button disabled={signingOut} onClick={handleSignOut} className="mt-8 border border-border px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-muted-foreground hover:bg-secondary hover:text-foreground">{signingOut?'Signing out...':'Sign out'}</button>
      </Card>
      <Card className="p-7">
        <h2 className="font-display text-xl font-black uppercase">Change password</h2>
        <form onSubmit={changePassword} className="mt-5 space-y-5">
          <label className="block text-sm font-semibold">Current password<input type="password" value={currentPassword} onChange={event=>setCurrentPassword(event.target.value)} className="mt-2 w-full border border-border bg-background p-3 font-normal" required/></label>
          <label className="block text-sm font-semibold">New password<input type="password" value={newPassword} onChange={event=>setNewPassword(event.target.value)} minLength={8} className="mt-2 w-full border border-border bg-background p-3 font-normal" required/></label>
          {notice&&<p className="text-sm text-accent">{notice}</p>}
          <button disabled={saving} className="bg-accent px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-accent-foreground">{saving?'Updating...':'Update password'}</button>
        </form>
      </Card>
    </div>
  </>
}
