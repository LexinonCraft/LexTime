import { useLiveQuery } from "dexie-react-hooks"

import {
  addActivitySession,
  createActivity,
  deleteActivity,
  deleteActivitySessions,
  getActivityById,
  listActivities,
  listAllSessions,
  listRecentActivities,
  startActivity,
  stopActivity,
  updateActivity,
  updateActivitySession,
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

export function useActivity(activityId: string | undefined): { loading: boolean, activityWithSessions: ActivityWithSessions | undefined } {
  return useLiveQuery(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000)) // DEBUG: remove

    if (!activityId) {
      return { loading: true, activityWithSessions: undefined }
    }

    const [activity, sessions] = await Promise.all([
      getActivityById(activityId),
      listAllSessions(),
    ])

    if (!activity) {
      return { loading: false, activityWithSessions: undefined }
    }

    return {
      loading: false,
      activityWithSessions: {
        activity,
        sessions: sessions.filter((session) => session.activityId === activity.id),
      }
    }
  }, [activityId], { loading: true, activityWithSessions: undefined })
}

export function useActivityActions() {
  return {
    addActivitySession,
    createActivity,
    deleteActivitySessions,
    startActivity,
    stopActivity,
    updateActivity,
    updateActivitySession,
    updateActivityTags,
    deleteActivity,
  }
}
