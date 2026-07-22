import { createFileRoute } from "@tanstack/react-router"
import { Link, Outlet, useLocation } from "@tanstack/react-router"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFilteredWorkItems, getUniqueTags, useWorkItems } from "@/hooks/useWorkItems"
import { toVisibleTree } from "@/lib/workItems"
import type { WorkItem, WorkItemStatus } from "@/types/domain"

export const Route = createFileRoute("/projects")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()

  if (location.pathname !== "/projects") {
    return <Outlet />
  }

  const items = useWorkItems()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(items.filter((item) => item.parentId === null).map((item) => item.id)))

  const searchParams = new URLSearchParams(window.location.search)
  const filter = {
    query: searchParams.get("query") ?? "",
    status: toStatusFilter(searchParams.get("status")),
    tag: searchParams.get("tag") ?? "all",
    maxDepth: toMaxDepth(searchParams.get("maxDepth")),
  }

  const tags = getUniqueTags(items)
  const filtered = getFilteredWorkItems(items, filter.query, filter.status, filter.tag)
  const visibleIds = useMemo(() => withAncestors(filtered, items), [filtered, items])

  const treeItems = toVisibleTree(items, expandedIds, filter.maxDepth, visibleIds)

  const onToggleExpand = (itemId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  return (
    <div className="space-y-4 p-3">
      <h1 className="text-3xl font-bold">Projects</h1>

      <Card>
        <CardHeader>
          <CardTitle>Browse hierarchy</CardTitle>
          <CardDescription>Expand projects up to your selected depth. Open details to drill deeper.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/projects/create" search={{}}>Create root project</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/projects/filter" search={filter}>Customize filter</Link>
          </Button>
          <div className="w-full text-xs text-muted-foreground">
            Active filter: query "{filter.query || "-"}", status {statusFilterLabel(filter.status)}, tag {filter.tag}, depth {filter.maxDepth}
          </div>
          {tags.length > 0 && <div className="w-full text-xs text-muted-foreground">Known tags: {tags.join(", ")}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hierarchy</CardTitle>
          <CardDescription>Collapsed nodes preserve context. Open a project to inspect all children.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {treeItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No matching items.</p>
          )}

          {treeItems.map((node) => (
            <div
              key={node.item.id}
              className="rounded-md p-2 ring-1 ring-border"
              style={{ marginLeft: `${node.depth * 16}px` }}
            >
              <div className="flex items-center gap-2">
                {node.hasChildren && node.depth < filter.maxDepth ? (
                  <button
                    type="button"
                    className="rounded p-1 hover:bg-muted"
                    onClick={() => onToggleExpand(node.item.id)}
                    aria-label={expandedIds.has(node.item.id) ? "Collapse" : "Expand"}
                  >
                    {expandedIds.has(node.item.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <span className="w-6" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{node.item.title}</div>
                  <div className="text-xs text-muted-foreground">{statusLabel(node.item.status)}</div>
                  {node.showFullPath && (
                    <div className="truncate text-xs text-muted-foreground">Path: {node.fullPath}</div>
                  )}
                  {node.hiddenChildrenCount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {node.hiddenChildrenCount} deeper children hidden at depth limit. Open details to view.
                    </div>
                  )}
                </div>

                <Button asChild size="sm" variant="outline">
                  <Link to="/projects/$projectId" params={{ projectId: node.item.id }}>Open</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function withAncestors(filteredItems: WorkItem[], allItems: WorkItem[]): Set<string> {
  const byId = new Map(allItems.map((item) => [item.id, item]))
  const ids = new Set<string>()

  filteredItems.forEach((item) => {
    let current: WorkItem | undefined = item
    while (current) {
      ids.add(current.id)
      current = current.parentId ? byId.get(current.parentId) : undefined
    }
  })

  return ids
}

function toStatusFilter(value: unknown): WorkItemStatus | "all" {
  if (value === "todo" || value === "in_progress" || value === "done" || value === "archived") {
    return value
  }

  return "all"
}

function toMaxDepth(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 2
  }

  return Math.min(6, Math.max(1, Math.floor(parsed)))
}

function statusLabel(status: WorkItemStatus): string {
  switch (status) {
    case "todo":
      return "To do"
    case "in_progress":
      return "In progress"
    case "done":
      return "Done"
    case "archived":
      return "Archived"
    default:
      return status
  }
}

function statusFilterLabel(status: WorkItemStatus | "all"): string {
  if (status === "all") {
    return "All"
  }

  return statusLabel(status)
}
