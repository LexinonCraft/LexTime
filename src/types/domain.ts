export type WorkItemStatus = "todo" | "in_progress" | "done"

export interface WorkItem {
  id: string
  title: string
  description: string
  status: WorkItemStatus | null
  tags: string[]
  allowActivities: boolean
  parentId: string | null
  createdAt: number
  updatedAt: number
}

export interface Activity {
  id: string
  workItemId: string
  title: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface ActivitySession {
  id: string
  activityId: string
  startAt: number
  endAt: number | null
}

export interface AppSettings {
  id: "app"
  autoSeededAt: number | null
  updatedAt: number
  language: string
}

export interface SeedState {
  id: "seed"
  initializedAt: number
}
