import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkItemStatus } from "@/types/domain"

export const Route = createFileRoute("/projects/filter")({
  validateSearch: (search: Record<string, unknown>) => ({
    query: typeof search.query === "string" ? search.query : "",
    status: toStatusFilter(search.status),
    tag: typeof search.tag === "string" ? search.tag : "all",
    maxDepth: toMaxDepth(search.maxDepth),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [query, setQuery] = useState(search.query)
  const [status, setStatus] = useState<WorkItemStatus | "all">(search.status)
  const [tag, setTag] = useState(search.tag)
  const [maxDepth, setMaxDepth] = useState(String(search.maxDepth))

  const onApply = () => {
    navigate({
      to: "/projects",
      search: {
        query,
        status,
        tag,
        maxDepth: toMaxDepth(maxDepth),
      },
    })
  }

  return (
    <div className="space-y-4 p-3">
      <h1 className="text-3xl font-bold">Project filter</h1>

      <Card>
        <CardHeader>
          <CardTitle>Customize hierarchy view</CardTitle>
          <CardDescription>Set query, status, tag, and maximum visible depth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={query}
            placeholder="Search title/description"
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={status}
            onChange={(event) => setStatus(toStatusFilter(event.target.value))}
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
          </select>

          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={tag}
            placeholder="Tag (or all)"
            onChange={(event) => setTag(event.target.value.trim() || "all")}
          />

          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            type="number"
            min={1}
            max={6}
            value={maxDepth}
            onChange={(event) => setMaxDepth(event.target.value)}
          />

          <div className="flex gap-2">
            <Button className="flex-1" onClick={onApply}>Apply filter</Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => navigate({ to: "/projects", search: { query: "", status: "all", tag: "all", maxDepth: 2 } })}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
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
