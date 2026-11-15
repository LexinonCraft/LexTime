import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"

import { useNow } from "@/hooks/useNow"
import { db } from "@/lib/db"

export default function useElapsedTime(activityId: string) {
  const closedSessionsElapsedTime = useLiveQuery(async () => {
    const sessions = await db.activitySessions
      .where("activityId")
      .equals(activityId)
      .and((session) => session.endAt !== null)
      .toArray()
    return sessions.reduce((total, session) => total + (session.endAt! - session.startAt), 0)
  }, [activityId], null)

  const openSessionsStartTimes = useLiveQuery(async () => {
    const sessions = await db.activitySessions
      .where("activityId")
      .equals(activityId)
      .and((session) => session.endAt === null)
      .toArray()
    return sessions.map((session) => session.startAt)
  }, [activityId], null)

  const now = useNow()

  const result = useMemo(() => {
    if (closedSessionsElapsedTime === null || openSessionsStartTimes === null) {
      return null
    }
    return closedSessionsElapsedTime + openSessionsStartTimes.reduce((total, startAt) => total + (now - startAt), 0)
  }, [closedSessionsElapsedTime, openSessionsStartTimes, now])

  return result
}
