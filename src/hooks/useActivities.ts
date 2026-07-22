import { useLiveQuery } from "dexie-react-hooks"

import {
  createActivity,
  getActivityById,
  listActivities,
  listAllSessions,
  listRecentActivities,
  startActivity,
  stopActivity,
  updateActivity,
  updateActivityTags,
} from "@/data/repositories/activitiesRepository"
import type { Activity, ActivitySession } from "@/types/domain"

export interface ActivityWithSessions {
  activity: Activity
  sessions: ActivitySession[]
}

export function useActivities(): ActivityWithSessions[] {
  return (
    useLiveQuery(async () => {
      const [activities, sessions] = await Promise.all([
        listActivities(),
        listAllSessions(),
      ])

      return activities.map((activity) => ({
        activity,
        sessions: sessions.filter((session) => session.activityId === activity.id),
      }))
    }, []) ?? []
  )
}

export function useRecentActivities(limit = 8): ActivityWithSessions[] {
  return (
    useLiveQuery(async () => {
      const [activities, sessions] = await Promise.all([
        listRecentActivities(limit),
        listAllSessions(),
      ])

      return activities.map((activity) => ({
        activity,
        sessions: sessions.filter((session) => session.activityId === activity.id),
      }))
    }, [limit]) ?? []
  )
}

export function useActivity(activityId: string | undefined): ActivityWithSessions | undefined {
  return useLiveQuery(async () => {
    if (!activityId) {
      return undefined
    }

    const [activity, sessions] = await Promise.all([
      getActivityById(activityId),
      listAllSessions(),
    ])

    if (!activity) {
      return undefined
    }

    return {
      activity,
      sessions: sessions.filter((session) => session.activityId === activity.id),
    }
  }, [activityId])
}

export function useActivityActions() {
  return {
    createActivity,
    startActivity,
    stopActivity,
    updateActivity,
    updateActivityTags,
  }
}
