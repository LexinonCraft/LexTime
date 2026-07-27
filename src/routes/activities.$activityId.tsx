import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useActivity, useActivityActions } from "@/hooks/useActivities"
import { useNow } from "@/hooks/useNow"
import { useWorkItems } from "@/hooks/useWorkItems"
import { formatDuration, formatRelativeTime, getElapsedMs } from "@/lib/time"
import { useToast } from "@/components/ui/toast"
import TitleBarLayout from "@/layouts/TitleBarLayout"
import DefaultTitleBarContent from "@/components/DefaultTitleBarContent"
import { CircleEllipsis, Pause, StepForward } from "lucide-react"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/activities/$activityId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { activityId } = Route.useParams()
  const now = useNow()
  const activityRow = useActivity(activityId)
  const items = useWorkItems()
  const { showToast } = useToast()

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

  return <TitleBarLayout titleBarContent={<TitleBarContent />}>
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center justify-center w-full h-50">
        <span className="text-3xl">{elapsed}</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{activityRow.activity.title || linkedItem?.title || "Untitled activity"}</CardTitle>
          <CardDescription>
            updated {formatRelativeTime(activityRow.activity.updatedAt, now)}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-row gap-2 items-stretch h-20">
          <Button variant="default" className={cn(
            "flex-1 flex h-full [&_svg]:!size-6",
            activityRow.activity.state !== "running" ? "text-green-800 bg-green-200" : "text-black bg-gray-200"
          )} disabled={activityRow.activity.state === "running"} onClick={async () => {
            await startActivity(activityRow.activity.id)
            showToast("Activity started")
          }}>
            <StepForward />
          </Button>
          <Button variant="secondary" className={cn(
            "flex-1 flex h-full [&_svg]:!size-6",
            activityRow.activity.state === "running" ? "text-orange-800 bg-orange-200" : "text-black bg-gray-200"
          )} disabled={activityRow.activity.state !== "running"} onClick={async () => {
            await stopActivity(activityRow.activity.id)
            showToast("Activity stopped")
          }}>
            <Pause />
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Related work item</CardTitle>
        </CardHeader>
        <CardContent>
          (TODO: insert card here)
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Activity sessions</CardTitle>
        </CardHeader>
        <CardContent>
          (TODO: insert activity sessions here)
        </CardContent>
      </Card>

      <div className="h-200" />
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
          showToast={showToast}
        />
      </Card>
    </div>
  </TitleBarLayout>
}

function TitleBarContent() {
  return <DefaultTitleBarContent title="Activity details" rightIcons={<>
    <Button variant="ghost" aria-label="Settings" className="[&_svg]:!size-6 text-primary">
        <Link to="/settings">
          <CircleEllipsis />
        </Link>
      </Button>
  </>} />
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
  showToast: (message: string) => void
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
  showToast,
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
        <Button
          className="flex-1"
          onClick={async () => {
            if (state === "running") {
              await stopActivity(activityId)
              showToast("Activity paused")
            } else {
              await startActivity(activityId)
              showToast("Activity started")
            }
          }}
        >
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
