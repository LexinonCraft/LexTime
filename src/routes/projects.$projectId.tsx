import { useMemo, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { CircleEllipsis, Pencil, Plus } from "lucide-react"

import Activity from "@/components/Activity"
import DefaultTitleBarContent from "@/components/DefaultTitleBarContent"
import { Hashtag, StatusTag, TagList } from "@/components/Tag"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/toast"
import { useActivities, useActivityActions } from "@/hooks/useActivities"
import { useWorkItem, useWorkItemActions, useWorkItems } from "@/hooks/useWorkItems"
import TitleBarLayout from "@/layouts/TitleBarLayout"
import { formatDuration } from "@/lib/time"
import { getDirectChildren, getPath } from "@/lib/workItems"
import type { WorkItemStatus } from "@/types/domain"

export const Route = createFileRoute("/projects/$projectId")({
  component: RouteComponent,
})

function titleBarRightIcons() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary">
          <CircleEllipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          x
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RouteComponent() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()

  const item = useWorkItem(projectId)
  const allItems = useWorkItems()
  const activityRows = useActivities()
  const { showToast } = useToast()

  const { setWorkItemStatus, updateWorkItem } = useWorkItemActions()
  const { createActivity } = useActivityActions()

  const [editingMetadata, setEditingMetadata] = useState(false)

  const [newActivityTitle, setNewActivityTitle] = useState("")
  const [newActivityTags, setNewActivityTags] = useState("")
  const [startImmediately, setStartImmediately] = useState(true)

  const children = useMemo(() => getDirectChildren(allItems, projectId), [allItems, projectId])
  const relatedActivities = activityRows.filter((row) => row.activity.workItemId === projectId)

  if (!item) {
    return (
      <div className="p-3">
        <Card>
          <CardHeader>
            <CardTitle>Project not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const onCreateActivity = async () => {
    const created = await createActivity({
      workItemId: item.id,
      title: newActivityTitle,
      tags: parseTags(newActivityTags),
      startNow: startImmediately,
    })

    setNewActivityTitle("")
    setNewActivityTags("")
    showToast(startImmediately ? "Activity started" : "Activity created")
    navigate({ to: "/activities/$activityId", params: { activityId: created.id } })
  }

  return <TitleBarLayout titleBarContent={<DefaultTitleBarContent title={item.title} rightIcons={titleBarRightIcons()} />}>
    <div className="space-y-4 p-3">
      <Card>
        <CardHeader>
          <CardDescription>{getPath(allItems, item.id)}</CardDescription>
          <CardTitle>{item.title}</CardTitle>
          <CardAction>
            <Button variant="secondary" disabled={editingMetadata} onClick={() => setEditingMetadata(true)}><Pencil className={!editingMetadata ? "text-primary" : "text-muted-foreground"} /></Button>
          </CardAction>
        </CardHeader>
        {editingMetadata ?
          <ProjectMetadataEditor
            key={item.id}
            itemId={item.id}
            title={item.title}
            description={item.description}
            tags={item.tags}
            updateWorkItem={async (id, patch) => { updateWorkItem(id, patch); setEditingMetadata(false); }}
            setWorkItemStatus={setWorkItemStatus}
          />
          :
          <CardContent className="space-y-2">
            <TagList>
              <StatusTag status={statusLabel(item.status ?? "todo")} textColor={statusTextColor(item.status ?? "todo")} backgroundColor={statusBackgroundColor(item.status ?? "todo")} />
              {
                item.tags.map((tag) => (
                  <Hashtag key={tag} tag={tag} />
                ))
              }
            </TagList>
            {item.description ?
              <div className="text-sm">{item.description}</div>
              :
              <div className="text-sm italic text-muted-foreground">No description</div>
            }
          </CardContent>
        }
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subprojects</CardTitle>
          <CardAction>
            <Button variant="secondary" asChild><Link to="/projects/create" search={{ parentId: item.id }} replace><Plus className="text-primary" /></Link></Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-2">
          {children.length === 0 && <p className="text-sm text-muted-foreground">No direct children yet.</p>}
          {children.map((child) => (
            <div key={child.id} className="flex items-center justify-between rounded-md bg-muted p-2">
              <div>
                <div className="font-medium">{child.title}</div>
                <div className="text-xs text-muted-foreground">{statusLabel(child.status ?? "todo")}</div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/projects/$projectId" params={{ projectId: child.id }}>Open</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create activity</CardTitle>
          <CardDescription>Optional title, tags, and start instantly option.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={newActivityTitle}
            placeholder="Optional activity title"
            onChange={(event) => setNewActivityTitle(event.target.value)}
          />
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={newActivityTags}
            placeholder="Activity tags (comma separated)"
            onChange={(event) => setNewActivityTags(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(event) => setStartImmediately(event.target.checked)}
            />
            Start instantly
          </label>
          <Button className="w-full" onClick={onCreateActivity}>Create activity</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {relatedActivities.length === 0 && <p className="text-sm text-muted-foreground">No activities yet.</p>}
          {relatedActivities.map(({ activity }) => (
            <Activity
              key={activity.id}
              id={activity.id}
              title={activity.title || item.title}
              subtitle={`Tracked ${formatDuration(42000 /* TODO */)}`}
              tags={activity.tags}
              state={"running"}
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
          ))}
        </CardContent>
      </Card>
    </div>
  </TitleBarLayout>
}

interface ProjectMetadataEditorProps {
  itemId: string
  title: string
  description: string
  tags: string[]
  updateWorkItem: ReturnType<typeof useWorkItemActions>["updateWorkItem"]
  setWorkItemStatus: ReturnType<typeof useWorkItemActions>["setWorkItemStatus"]
}

function ProjectMetadataEditor({
  itemId,
  title,
  description,
  tags,
  updateWorkItem,
  setWorkItemStatus,
}: ProjectMetadataEditorProps) {
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftDescription, setDraftDescription] = useState(description)
  const [draftTags, setDraftTags] = useState(tags.join(", "))

  const onSaveProject = async () => {
    await updateWorkItem(itemId, {
      title: draftTitle,
      description: draftDescription,
      tags: parseTags(draftTags),
    })
  }

  return (
    <CardContent className="space-y-3">
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3"
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
      />
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3"
        value={draftDescription}
        onChange={(event) => setDraftDescription(event.target.value)}
      />
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3"
        value={draftTags}
        onChange={(event) => setDraftTags(event.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setWorkItemStatus(itemId, "todo")}>To do</Button>
        <Button variant="secondary" onClick={() => setWorkItemStatus(itemId, "in_progress")}>In progress</Button>
        <Button variant="secondary" onClick={() => setWorkItemStatus(itemId, "done")}>Done</Button>
      </div>

      <Button className="w-full" onClick={onSaveProject}>Save metadata</Button>
    </CardContent>
  )
}

function parseTags(input: string): string[] {
  return [...new Set(input.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
}

function statusLabel(status: WorkItemStatus): string {
  switch (status) {
  case "todo":
    return "To do"
  case "in_progress":
    return "In progress"
  case "done":
    return "Done"
  default:
    return status
  }
}

function statusBackgroundColor(status: WorkItemStatus): string {
  switch (status) {
  case "todo":
    return "bg-red-100"
  case "in_progress":
    return "bg-yellow-100"
  case "done":
    return "bg-green-100"
  default:
    return "bg-gray-100"
  }
}

function statusTextColor(status: WorkItemStatus): string {
  switch (status) {
  case "todo":
    return "text-red-800"
  case "in_progress":
    return "text-yellow-800"
  case "done":
    return "text-green-800"
  default:
    return "text-gray-800"
  }
}
