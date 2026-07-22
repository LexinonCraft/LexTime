import { db } from "@/lib/db"
import type { Activity, SeedState, WorkItem } from "@/types/domain"

const SEED_ROW_ID = "seed"

export async function ensureSeedData(): Promise<void> {
  const existing = await db.seedState.get(SEED_ROW_ID)

  if (existing) {
    return
  }

  const now = Date.now()

  const universityId = "seed-university"
  const dataStructuresId = "seed-datastructures"
  const sheetId = "seed-exercise-sheet-1"

  const items: WorkItem[] = [
    {
      id: universityId,
      title: "University",
      description: "Top-level topic for university work.",
      status: "in_progress",
      tags: ["study"],
      parentId: null,
      createdAt: now - 8_640_000,
      updatedAt: now - 8_640_000,
    },
    {
      id: dataStructuresId,
      title: "Datastructures",
      description: "Lecture and assignments.",
      status: "in_progress",
      tags: ["course"],
      parentId: universityId,
      createdAt: now - 5_400_000,
      updatedAt: now - 5_400_000,
    },
    {
      id: sheetId,
      title: "Exercise sheet 1",
      description: "Implement and analyze required tasks.",
      status: "todo",
      tags: ["exercise", "important"],
      parentId: dataStructuresId,
      createdAt: now - 3_600_000,
      updatedAt: now - 3_600_000,
    },
  ]

  const activities: Activity[] = [
    {
      id: "seed-activity-sheet-1",
      workItemId: sheetId,
      title: "Morning focus block",
      tags: ["home"],
      state: "not_running",
      createdAt: now - 3_000_000,
      updatedAt: now - 1_200_000,
    },
  ]

  await db.transaction("rw", db.workItems, db.activities, db.activitySessions, db.seedState, async () => {
    await db.workItems.bulkAdd(items)
    await db.activities.bulkAdd(activities)
    await db.activitySessions.bulkAdd([
      {
        id: "seed-session-1",
        activityId: "seed-activity-sheet-1",
        startAt: now - 2_700_000,
        endAt: now - 2_100_000,
      },
      {
        id: "seed-session-2",
        activityId: "seed-activity-sheet-1",
        startAt: now - 1_800_000,
        endAt: now - 1_200_000,
      },
    ])

    const seedState: SeedState = {
      id: SEED_ROW_ID,
      initializedAt: now,
    }

    await db.seedState.put(seedState)
  })
}
