export type WorkItemStatus = "todo" | "in_progress" | "done" | "archived"

export interface WorkItem {
  id: string
  title: string
  description: string
  status: WorkItemStatus
  tags: string[]
  parentId: string | null
  createdAt: number
  updatedAt: number
}

export type ActivityState = "running" | "not_running"

export interface Activity {
  id: string
  workItemId: string
  title: string
  tags: string[]
  state: ActivityState
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
}

export interface SeedState {
  id: "seed"
  initializedAt: number
}
