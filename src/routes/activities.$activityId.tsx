import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActivity, useActivityActions } from "@/hooks/useActivities"
import { useNow } from "@/hooks/useNow"
import { useWorkItems } from "@/hooks/useWorkItems"
import { formatDuration, formatRelativeTime, getElapsedMs } from "@/lib/time"

export const Route = createFileRoute("/activities/$activityId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { activityId } = Route.useParams()
  const now = useNow()
  const activityRow = useActivity(activityId)
  const items = useWorkItems()

  const { startActivity, stopActivity, updateActivity } = useActivityActions()

  const linkedItem = useMemo(() => {
    if (!activityRow) {
      return undefined
    }

    return items.find((item) => item.id === activityRow.activity.workItemId)
  }, [activityRow, items])

  if (!activityRow) {
    return (
      <div className="p-3">
        <Card>
          <CardHeader>
            <CardTitle>Activity not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const elapsed = formatDuration(getElapsedMs(activityRow.activity, activityRow.sessions, now))

  return (
    <div className="space-y-4 p-3">
      <h1 className="text-3xl font-bold">Activity details</h1>

      <Card>
        <CardHeader>
          <CardTitle>{activityRow.activity.title || linkedItem?.title || "Untitled activity"}</CardTitle>
          <CardDescription>
            Tracked {elapsed} - updated {formatRelativeTime(activityRow.activity.updatedAt, now)}
          </CardDescription>
        </CardHeader>
        <ActivityDetailEditor
          key={activityRow.activity.id}
          activityId={activityRow.activity.id}
          title={activityRow.activity.title}
          tags={activityRow.activity.tags}
          state={activityRow.activity.state}
          linkedProjectId={linkedItem?.id}
          updateActivity={updateActivity}
          startActivity={startActivity}
          stopActivity={stopActivity}
        />
      </Card>
    </div>
  )
}

interface ActivityDetailEditorProps {
  activityId: string
  title: string
  tags: string[]
  state: "running" | "not_running"
  linkedProjectId: string | undefined
  updateActivity: ReturnType<typeof useActivityActions>["updateActivity"]
  startActivity: ReturnType<typeof useActivityActions>["startActivity"]
  stopActivity: ReturnType<typeof useActivityActions>["stopActivity"]
}

function ActivityDetailEditor({
  activityId,
  title,
  tags,
  state,
  linkedProjectId,
  updateActivity,
  startActivity,
  stopActivity,
}: ActivityDetailEditorProps) {
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftTags, setDraftTags] = useState(tags.join(", "))

  const onSave = async () => {
    await updateActivity(activityId, {
      title: draftTitle,
      tags: parseTags(draftTags),
    })
  }

  return (
    <CardContent className="space-y-3">
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3"
        value={draftTitle}
        placeholder="Optional title"
        onChange={(event) => setDraftTitle(event.target.value)}
      />
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3"
        value={draftTags}
        placeholder="Tags (comma separated)"
        onChange={(event) => setDraftTags(event.target.value)}
      />

      {linkedProjectId && (
        <Button asChild variant="outline" className="w-full">
          <Link to="/projects/$projectId" params={{ projectId: linkedProjectId }}>Open linked project</Link>
        </Button>
      )}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => (state === "running" ? stopActivity(activityId) : startActivity(activityId))}>
          {state === "running" ? "Stop" : "Start"}
        </Button>
        <Button className="flex-1" variant="outline" onClick={onSave}>Save details</Button>
      </div>
    </CardContent>
  )
}

function parseTags(input: string): string[] {
  return [...new Set(input.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
}
