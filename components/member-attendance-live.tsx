"use client"

import useSWR from "swr"
import { Card, Title, Badge } from "./member-portal"

const fetcher = (url: string) => fetch(url).then(async response => { if (!response.ok) throw new Error("load-failed"); return response.json() })

export function MemberAttendanceLive() {
  const { data, error, isLoading, mutate } = useSWR<Array<{ id: string; title: string; startsAt: string; status: string; note: string | null }>>("/api/member/attendance", fetcher)
  if (isLoading) return <><Title eyebrow="Training record" title="Attendance" /><div className="h-40 animate-pulse bg-card" /></>
  if (error) return <Card className="p-8"><Title eyebrow="Training record" title="Attendance" /><p className="text-sm text-muted-foreground">Couldn&apos;t load attendance.</p><button onClick={() => mutate()} className="mt-4 bg-accent px-4 py-3 text-xs font-bold uppercase tracking-[.14em] text-accent-foreground">Try again</button></Card>
  return <><Title eyebrow="Training record" title="Attendance" /><div className="grid gap-4">{data?.length ? data.map(item => <Card key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><Badge tone={item.status === "present" ? "accent" : "muted"}>{item.status}</Badge><h2 className="mt-3 font-display text-xl font-black uppercase">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.startsAt))}</p></div>{item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}</Card>) : <Card className="p-8 text-center text-sm text-muted-foreground">Attendance will appear after your booked sessions.</Card>}</div></>
}
