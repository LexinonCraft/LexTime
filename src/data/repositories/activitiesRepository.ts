import { db } from "@/lib/db"
import { createId } from "@/lib/id"
import type { Activity, ActivitySession } from "@/types/domain"
import { touchWorkItem } from "@/data/repositories/workItemsRepository"

export interface CreateActivityInput {
  workItemId: string
  title?: string
  startNow?: boolean
  tags?: string[]
}

export async function listActivities(): Promise<Activity[]> {
  return db.activities.orderBy("updatedAt").reverse().toArray()
}

export async function listRecentActivities(limit = 8): Promise<Activity[]> {
  return db.activities.orderBy("updatedAt").reverse().limit(limit).toArray()
}

export async function listActivitiesForWorkItem(workItemId: string): Promise<Activity[]> {
  return db.activities.where("workItemId").equals(workItemId).reverse().sortBy("updatedAt")
}

export async function listSessionsForActivity(activityId: string): Promise<ActivitySession[]> {
  return db.activitySessions.where("activityId").equals(activityId).sortBy("startAt")
}

export async function listAllSessions(): Promise<ActivitySession[]> {
  return db.activitySessions.toArray()
}

export async function getActivityById(activityId: string): Promise<Activity | undefined> {
  return db.activities.get(activityId)
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const now = Date.now()
  const activityId = createId("activity")
  const workItem = await db.workItems.get(input.workItemId)
  const startNow = input.startNow ?? true

  const activity: Activity = {
    id: activityId,
    workItemId: input.workItemId,
    title: input.title?.trim() ?? "",
    tags: normalizeTags(input.tags ?? []),
    state: startNow ? "running" : "not_running",
    createdAt: now,
    updatedAt: now,
  }

  await db.transaction("rw", db.activities, db.activitySessions, async () => {
    await db.activities.add(activity)

    if (startNow) {
      await db.activitySessions.add({
        id: createId("session"),
        activityId,
        startAt: now,
        endAt: null,
      })
    }
  })

  if (workItem?.status === "todo") {
    await db.workItems.update(workItem.id, {
      status: "in_progress",
      updatedAt: now,
    })
  }

  await touchWorkItem(input.workItemId)

  return activity
}

export async function startActivity(activityId: string): Promise<void> {
  const activity = await db.activities.get(activityId)
  if (!activity || activity.state === "running") {
    return
  }

  const now = Date.now()

  await db.transaction("rw", db.activities, db.activitySessions, async () => {
    await db.activities.update(activityId, {
      state: "running",
      updatedAt: now,
    })

    await db.activitySessions.add({
      id: createId("session"),
      activityId,
      startAt: now,
      endAt: null,
    })
  })

  await touchWorkItem(activity.workItemId)
}

export async function stopActivity(activityId: string): Promise<void> {
  const activity = await db.activities.get(activityId)
  if (!activity || activity.state !== "running") {
    return
  }

  const now = Date.now()

  const openSession = await db.activitySessions
    .where("activityId")
    .equals(activityId)
    .filter((session) => session.endAt === null)
    .last()

  await db.transaction("rw", db.activities, db.activitySessions, async () => {
    if (openSession) {
      await db.activitySessions.update(openSession.id, { endAt: now })
    }

    await db.activities.update(activityId, {
      state: "not_running",
      updatedAt: now,
    })
  })

  await touchWorkItem(activity.workItemId)
}

export async function updateActivityTags(activityId: string, tags: string[]): Promise<void> {
  const activity = await db.activities.get(activityId)
  if (!activity) {
    return
  }

  await db.activities.update(activityId, {
    tags: normalizeTags(tags),
    updatedAt: Date.now(),
  })

  await touchWorkItem(activity.workItemId)
}

export async function updateActivity(
  activityId: string,
  patch: Partial<Pick<Activity, "title" | "tags">>,
): Promise<void> {
  const activity = await db.activities.get(activityId)
  if (!activity) {
    return
  }

  const nextPatch: Partial<Activity> = {
    updatedAt: Date.now(),
  }

  if (typeof patch.title === "string") {
    nextPatch.title = patch.title.trim()
  }

  if (typeof patch.tags !== "undefined") {
    nextPatch.tags = normalizeTags(patch.tags)
  }

  await db.activities.update(activityId, nextPatch)
  await touchWorkItem(activity.workItemId)
}

function normalizeTags(tags: string[]): string[] {
  const cleaned = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => tag.toLowerCase())

  return [...new Set(cleaned)]
}
