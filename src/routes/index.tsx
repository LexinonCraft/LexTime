import { createFileRoute, Link } from '@tanstack/react-router'
import { Settings } from 'lucide-react'

import Activity from '@/components/Activity'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { useActivityActions, useRecentActivities } from '@/hooks/useActivities'
import { useNow } from '@/hooks/useNow'
import { useRecentlyUpdatedWorkItems, useWorkItems } from '@/hooks/useWorkItems'
import { formatDuration, formatRelativeTime } from '@/lib/time'
import type { WorkItemStatus } from '@/types/domain'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const now = useNow()
  const items = useWorkItems()
  const recentItems = useRecentlyUpdatedWorkItems(8)
  const recentActivities = useRecentActivities(8)
  const { createActivity } = useActivityActions()
  const { showToast } = useToast()

  const itemMap = new Map(items.map((item) => [item.id, item]))

  return <div className="p-3">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <Button variant="ghost" aria-label="Settings" className="[&_svg]:!size-6 text-primary">
        <Link to="/settings">
          <Settings />
        </Link>
      </Button>
    </div>

    <h2 className="my-3 text-2xl font-bold">Recent activities</h2>
    <div className="space-y-3">
      {recentActivities.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No activities yet</CardTitle>
            <CardDescription>Open a task below and start your first activity.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {recentActivities.map(({ activity }) => {
        const linkedItem = itemMap.get(activity.workItemId)
        const durationLabel = formatDuration(42000 /* TODO */)

        return (
          <Activity
            key={activity.id}
            id={activity.id}
            title={activity.title || linkedItem?.title || "Untitled activity"}
            subtitle={`Tracked ${durationLabel} - updated ${formatRelativeTime(activity.updatedAt, now)}`}
            tags={activity.tags}
            state={"not_running"}
            onToggleRunning={async () => {
              if (activity.id == "1") { // TODO
                // await stopActivity(activity.id) TODO
                showToast("Activity paused")
              } else {
                // await startActivity(activity.id) TODO
                showToast("Activity started")
              }
            }}
          />
        )
      })}
    </div>

    <h2 className="my-3 mt-7 text-2xl font-bold">Recently updated tasks</h2>
    <div className="space-y-3">
      {recentItems.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No tasks found</CardTitle>
            <CardDescription>Create tasks from Projects to get started.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {recentItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description || "No description"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-muted px-2 py-1">Status: {formatStatus(item.status)}</span>
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground">#{tag}</span>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                await createActivity({ workItemId: item.id, startNow: true })
                showToast("Activity started")
              }}
            >
              Start activity
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
}

function formatStatus(status: WorkItemStatus): string {
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
