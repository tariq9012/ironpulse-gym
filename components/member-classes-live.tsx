"use client"

import { useState } from "react"
import useSWR from "swr"
import { CalendarDays, Check, X } from "lucide-react"

interface ClassRecord { id: string; title: string; category: string; coach: string; startsAt: string; durationMinutes: number; capacity: number; bookedCount: number; spotsRemaining: number; room: string; isBooked: boolean; bookingId?: string }
const fetcher = (url: string) => fetch(url).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.message || "Unable to load classes."); return body })
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(value))
const timeLabel = (value: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value))

export function MemberClassesLive() {
  const { data, error, isLoading, mutate } = useSWR<{ data: ClassRecord[] }>("/api/member/classes", fetcher, { revalidateOnFocus: false })
  const [category, setCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [pending, setPending] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null)
  const classes = data?.data ?? []
  const filtered = classes.filter(item => (category === "All" || item.category === category) && item.title.toLowerCase().includes(search.toLowerCase()))
  const runBooking = async (item: ClassRecord) => {
    setPending(item.id); setNotice(null)
    try {
      const response = item.isBooked && item.bookingId ? await fetch(`/api/member/bookings/${item.bookingId}`, { method: "DELETE" }) : await fetch(`/api/member/classes/${item.id}/book`, { method: "POST" })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || "Unable to complete your booking.")
      await mutate()
      await fetch("/api/member/overview", { cache: "no-store" })
      setNotice({ text: body.message })
    } catch (bookingError) { setNotice({ text: bookingError instanceof Error ? bookingError.message : "Unable to complete your booking.", error: true }) } finally { setPending(null) }
  }
  if (isLoading) return <><div className="mb-8 h-10 w-72 animate-pulse bg-card"/><div className="grid gap-4">{[1, 2, 3].map(item => <div key={item} className="h-32 animate-pulse bg-card" />)}</div></>
  if (error) return <div className="border border-border bg-card p-8"><h1 className="font-display text-2xl font-black uppercase">Couldn&apos;t load the schedule.</h1><button onClick={() => mutate()} className="mt-5 bg-accent px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-accent-foreground">Try again</button></div>
  return <><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Find your next session</p><h1 className="mt-3 font-display text-4xl font-black uppercase tracking-[-.05em]">Class schedule</h1></div><button onClick={() => { setCategory("All"); setSearch("") }} className="text-xs font-bold uppercase tracking-[.14em] text-accent">Reset filters</button></div>{notice && <div className={`mb-5 flex items-center gap-2 border p-4 text-sm ${notice.error ? "border-destructive text-destructive" : "border-accent bg-accent/10 text-accent"}`}><Check size={16}/>{notice.text}<button aria-label="Dismiss" onClick={() => setNotice(null)} className="ml-auto"><X size={16}/></button></div>}<div className="mb-6 grid gap-3 sm:grid-cols-[1fr_200px]"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search classes" className="border border-border bg-card p-3 text-sm"/><select value={category} onChange={event => setCategory(event.target.value)} className="border border-border bg-card p-3 text-sm"><option>All</option>{Array.from(new Set(classes.map(item => item.category))).map(item => <option key={item}>{item}</option>)}</select></div><div className="grid gap-4">{filtered.map(item => { const busy = pending === item.id; const full = item.spotsRemaining === 0 && !item.isBooked; return <article key={item.id} className="flex flex-col gap-5 border border-border bg-card p-5 sm:flex-row sm:items-center"><div className="grid size-16 shrink-0 place-items-center bg-secondary text-accent"><CalendarDays size={20}/></div><div className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-accent">{full ? "Class full" : `${item.spotsRemaining} spots left`}</span><h2 className="mt-3 truncate font-display text-2xl font-black uppercase">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{dateLabel(item.startsAt)} · {timeLabel(item.startsAt)} · {item.durationMinutes} min · {item.room}</p><p className="mt-1 text-sm text-accent">{item.coach}</p></div><div className="flex flex-col items-stretch gap-3 sm:items-end"><span className="text-xs text-muted-foreground">{item.bookedCount}/{item.capacity} booked</span><button disabled={busy || full} onClick={() => runBooking(item)} className="border border-border px-5 py-3 text-xs font-bold uppercase tracking-[.14em] transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60">{busy ? (item.isBooked ? "Cancelling..." : "Booking...") : item.isBooked ? "Cancel booking" : full ? "Class full" : "Book class"}</button></div></article> })}{!filtered.length && <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">No future classes match your filters.</div>}</div></>
}
