import Dexie, { type EntityTable } from "dexie"

import type { Activity, ActivitySession, AppSettings, SeedState, WorkItem } from "@/types/domain"

class LexTimeDB extends Dexie {
  workItems!: EntityTable<WorkItem, "id">
  activities!: EntityTable<Activity, "id">
  activitySessions!: EntityTable<ActivitySession, "id">
  settings!: EntityTable<AppSettings, "id">
  seedState!: EntityTable<SeedState, "id">

  constructor() {
    super("LexTimeDB")

    this.version(1).stores({
      workItems: "id, parentId, status, updatedAt, createdAt",
      activities: "id, workItemId, state, updatedAt, createdAt, stoppedAt",
      activitySessions: "id, activityId, startAt, endAt",
      settings: "id, updatedAt",
      seedState: "id, initializedAt",
    })

    this.version(2).stores({
      workItems: "id, parentId, status, updatedAt, createdAt",
      activities: "id, workItemId, title, state, updatedAt, createdAt",
      activitySessions: "id, activityId, startAt, endAt",
      settings: "id, updatedAt",
      seedState: "id, initializedAt",
    })
  }
}

export const db = new LexTimeDB()

export async function resetDatabase(): Promise<void> {
  await db.transaction(
    "rw",
    db.workItems,
    db.activities,
    db.activitySessions,
    db.settings,
    db.seedState,
    async () => {
      await db.workItems.clear()
      await db.activities.clear()
      await db.activitySessions.clear()
      await db.settings.clear()
      await db.seedState.clear()
    },
  )

  await db.settings.put({
    id: "app",
    autoSeededAt: null,
    updatedAt: Date.now(),
  })
}
