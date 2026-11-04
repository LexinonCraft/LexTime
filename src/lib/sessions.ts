import { getLocalDayKey } from "@/lib/time"
import type { ActivitySession } from "@/types/domain"

export function groupSessionsByStartDay(sessions: ActivitySession[]) {
  const groups = new Map<string, { dayKey: string; timestamp: number; sessions: ActivitySession[] }>()

  for (const session of [...sessions].sort((first, second) => second.startAt - first.startAt)) {
    const dayKey = getLocalDayKey(session.startAt)
    const group = groups.get(dayKey) ?? { dayKey, timestamp: session.startAt, sessions: [] }
    group.sessions.push(session)
    groups.set(dayKey, group)
  }

  return [...groups.values()]
}

export function formatSessionDay(timestamp: number, now: number): string {
  const date = new Date(timestamp)
  const today = new Date(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (getLocalDayKey(timestamp) === getLocalDayKey(today.getTime())) return "Today"
  if (getLocalDayKey(timestamp) === getLocalDayKey(yesterday.getTime())) return "Yesterday"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date)
}

export function formatSessionTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestamp)
}

export function formatSessionEnd(startAt: number, endAt: number): string {
  if (getLocalDayKey(startAt) !== getLocalDayKey(endAt)) {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(endAt)
  }
  return formatSessionTime(endAt)
}
