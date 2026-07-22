import type { WorkItem } from "@/types/domain"

export interface WorkItemTreeNode {
  item: WorkItem
  depth: number
}

export interface VisibleWorkItemNode extends WorkItemTreeNode {
  hasChildren: boolean
  hiddenChildrenCount: number
  fullPath: string
  showFullPath: boolean
}

export function toTreeList(items: WorkItem[]): WorkItemTreeNode[] {
  const byParent = new Map<string | null, WorkItem[]>()

  items.forEach((item) => {
    const key = item.parentId
    const current = byParent.get(key) ?? []
    current.push(item)
    byParent.set(key, current)
  })

  byParent.forEach((group) => {
    group.sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const result: WorkItemTreeNode[] = []

  const walk = (parentId: string | null, depth: number): void => {
    const children = byParent.get(parentId) ?? []

    children.forEach((child) => {
      result.push({ item: child, depth })
      walk(child.id, depth + 1)
    })
  }

  walk(null, 0)
  return result
}

export function getDirectChildren(items: WorkItem[], parentId: string | null): WorkItem[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getLineage(items: WorkItem[], selectedId: string): WorkItem[] {
  const byId = new Map(items.map((item) => [item.id, item]))

  const lineage: WorkItem[] = []
  let current = byId.get(selectedId)

  while (current) {
    lineage.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return lineage
}

export function getFullPath(items: WorkItem[], selectedId: string): string {
  return getLineage(items, selectedId).map((item) => item.title).join(" / ")
}

export function getAmbiguousTitleIds(items: WorkItem[]): Set<string> {
  const titleCounts = new Map<string, number>()

  items.forEach((item) => {
    titleCounts.set(item.title.toLowerCase(), (titleCounts.get(item.title.toLowerCase()) ?? 0) + 1)
  })

  return new Set(
    items
      .filter((item) => (titleCounts.get(item.title.toLowerCase()) ?? 0) > 1)
      .map((item) => item.id),
  )
}

export function toVisibleTree(
  items: WorkItem[],
  expanded: Set<string>,
  maxDepth: number,
  allowedIds?: Set<string>,
): VisibleWorkItemNode[] {
  const byParent = new Map<string | null, WorkItem[]>()
  const ambiguousIds = getAmbiguousTitleIds(items)

  items.forEach((item) => {
    const key = item.parentId
    const current = byParent.get(key) ?? []
    current.push(item)
    byParent.set(key, current)
  })

  byParent.forEach((group) => {
    group.sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const result: VisibleWorkItemNode[] = []

  const walk = (parentId: string | null, depth: number): void => {
    const children = byParent.get(parentId) ?? []

    children.forEach((child) => {
      if (allowedIds && !allowedIds.has(child.id)) {
        return
      }

      const childItems = byParent.get(child.id) ?? []
      const hasChildren = childItems.length > 0
      const visibleAtDepth = depth < maxDepth

      result.push({
        item: child,
        depth,
        hasChildren,
        hiddenChildrenCount: visibleAtDepth ? 0 : countDescendants(byParent, child.id),
        fullPath: getFullPath(items, child.id),
        showFullPath: depth > 0 && ambiguousIds.has(child.id),
      })

      if (hasChildren && visibleAtDepth && expanded.has(child.id)) {
        walk(child.id, depth + 1)
      }
    })
  }

  walk(null, 0)
  return result
}

function countDescendants(byParent: Map<string | null, WorkItem[]>, parentId: string): number {
  const children = byParent.get(parentId) ?? []

  return children.reduce((count, child) => count + 1 + countDescendants(byParent, child.id), 0)
}
