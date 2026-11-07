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
  }, [activityId], 0)

  const openSessionsStartTimes = useLiveQuery(async () => {
    const sessions = await db.activitySessions
      .where("activityId")
      .equals(activityId)
      .and((session) => session.endAt === null)
      .toArray()
    return sessions.map((session) => session.startAt)
  }, [activityId], [])
  const now = useNow()
  const openSessionsElapsedTime = openSessionsStartTimes.reduce((total, startAt) => total + (now - startAt), 0)

  return closedSessionsElapsedTime + openSessionsElapsedTime
}
