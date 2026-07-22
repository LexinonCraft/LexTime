import { db } from "@/lib/db"
import { createId } from "@/lib/id"
import type { WorkItem, WorkItemStatus } from "@/types/domain"

export interface CreateWorkItemInput {
  title: string
  description?: string
  parentId?: string | null
  tags?: string[]
  status?: WorkItemStatus
}

export async function listWorkItems(): Promise<WorkItem[]> {
  return db.workItems.orderBy("updatedAt").reverse().toArray()
}

export async function getWorkItemById(id: string): Promise<WorkItem | undefined> {
  return db.workItems.get(id)
}

export async function createWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
  const now = Date.now()

  const workItem: WorkItem = {
    id: createId("item"),
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    parentId: input.parentId ?? null,
    status: input.status ?? "todo",
    tags: normalizeTags(input.tags ?? []),
    createdAt: now,
    updatedAt: now,
  }

  await db.workItems.add(workItem)
  return workItem
}

export async function updateWorkItem(
  id: string,
  patch: Partial<Pick<WorkItem, "title" | "description" | "tags" | "parentId" | "status">>,
): Promise<void> {
  const nextPatch: Partial<WorkItem> = {
    ...patch,
    updatedAt: Date.now(),
  }

  if (typeof patch.tags !== "undefined") {
    nextPatch.tags = normalizeTags(patch.tags)
  }

  if (typeof patch.title === "string") {
    nextPatch.title = patch.title.trim()
  }

  if (typeof patch.description === "string") {
    nextPatch.description = patch.description.trim()
  }

  await db.workItems.update(id, nextPatch)
}

export async function setWorkItemStatus(id: string, status: WorkItemStatus): Promise<void> {
  await db.workItems.update(id, {
    status,
    updatedAt: Date.now(),
  })
}

export async function touchWorkItem(id: string): Promise<void> {
  await db.workItems.update(id, { updatedAt: Date.now() })
}

export async function listRecentlyUpdatedWorkItems(limit = 8): Promise<WorkItem[]> {
  return db.workItems.orderBy("updatedAt").reverse().limit(limit).toArray()
}

function normalizeTags(tags: string[]): string[] {
  const cleaned = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => tag.toLowerCase())

  return [...new Set(cleaned)]
}
