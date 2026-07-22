import { useLiveQuery } from "dexie-react-hooks"

import {
  createWorkItem,
  getWorkItemById,
  listRecentlyUpdatedWorkItems,
  listWorkItems,
  setWorkItemStatus,
  updateWorkItem,
} from "@/data/repositories/workItemsRepository"
import type { WorkItem, WorkItemStatus } from "@/types/domain"

export function useWorkItems(): WorkItem[] {
  return useLiveQuery(listWorkItems, []) ?? []
}

export function useRecentlyUpdatedWorkItems(limit = 8): WorkItem[] {
  return useLiveQuery(() => listRecentlyUpdatedWorkItems(limit), [limit]) ?? []
}

export function useWorkItem(itemId: string | undefined): WorkItem | undefined {
  return useLiveQuery(async () => {
    if (!itemId) {
      return undefined
    }

    return getWorkItemById(itemId)
  }, [itemId])
}

export function useWorkItemActions() {
  return {
    createWorkItem,
    updateWorkItem,
    setWorkItemStatus,
  }
}

export function getUniqueTags(items: WorkItem[]): string[] {
  const tagSet = new Set<string>()

  items.forEach((item) => {
    item.tags.forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
}

export function getFilteredWorkItems(
  items: WorkItem[],
  query: string,
  status: WorkItemStatus | "all",
  tag: string | "all",
): WorkItem[] {
  const normalizedQuery = query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)

    const matchesStatus = status === "all" || item.status === status
    const matchesTag = tag === "all" || item.tags.includes(tag)

    return matchesQuery && matchesStatus && matchesTag
  })
}
