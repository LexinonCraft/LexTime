import { useLiveQuery } from "dexie-react-hooks"

import { isActivityRunning } from "@/data/repositories/activitiesRepository"

export type ActivityState = "running" | "not_running"

export default function useActivityStatus(activityId: string): ActivityState | undefined {
  return useLiveQuery(async (): Promise<ActivityState | undefined> => {
    return (await isActivityRunning(activityId)) ? "running" : "not_running"
  }, [activityId], undefined)
}
