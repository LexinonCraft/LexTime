import { useCallback, useMemo, useState } from "react"
import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Check, CircleCheckBig, CircleEllipsis, CircleX, Ellipsis, Pause, Pencil, Plus, StepForward, Trash2, X } from "lucide-react"
import { useForm } from "react-hook-form"

import DefaultTitleBarContent from "@/components/DefaultTitleBarContent"
import ModalView, { ConfirmationModal, simpleModalHandler } from "@/components/ModalView"
import { StatusTag, TagList } from "@/components/Tag"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { useToast } from "@/components/ui/toast"
import { type ActivityWithSessions, useActivity, useActivityActions } from "@/hooks/useActivities"
import { useNow } from "@/hooks/useNow"
import { useWorkItems } from "@/hooks/useWorkItems"
import TitleBarLayout from "@/layouts/TitleBarLayout"
import { formatSessionDay, formatSessionEnd, formatSessionTime, groupSessionsByStartDay } from "@/lib/sessions"
import { formatDuration, formatRelativeTime, getElapsedMs, toDateTimeLocalValue } from "@/lib/time"
import { cn } from "@/lib/utils"
import { getPath } from "@/lib/workItems"
import type { Activity, ActivitySession } from "@/types/domain"

export const Route = createFileRoute("/activities/$activityId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { activityId } = Route.useParams()
  const now = useNow()
  const activityRow = useActivity(activityId)
  const items = useWorkItems()
  const { showToast } = useToast()

  const { startActivity, stopActivity } = useActivityActions()

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

  const elapsed = formatDuration(getElapsedMs(activityRow.activity, activityRow.sessions, now), true)

  return <TitleBarLayout titleBarContent={<TitleBarContent onDeleteActivity={() => NiceModal.show(DeleteActivityConfirmationModal, { activityId: activityRow.activity.id })} />}>
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
          <CardAction>
            <Button variant="secondary" onClick={() => NiceModal.show(EditActivityModal, { activity: activityRow.activity })}><Pencil className="text-primary" /></Button>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-row gap-2 items-stretch h-20">
          <Button variant="default" className={cn(
            "flex-1 flex h-full [&_svg]:size-6!",
            activityRow.activity.state !== "running" ? "text-green-800 bg-green-200" : "text-black bg-gray-200"
          )} disabled={activityRow.activity.state === "running"} onClick={async () => {
            await startActivity(activityRow.activity.id)
            showToast("Activity started")
          }}>
            <StepForward />
          </Button>
          <Button variant="secondary" className={cn(
            "flex-1 flex h-full [&_svg]:size-6!",
            activityRow.activity.state === "running" ? "text-orange-800 bg-orange-200" : "text-black bg-gray-200"
          )} disabled={activityRow.activity.state !== "running"} onClick={async () => {
            await stopActivity(activityRow.activity.id)
            showToast("Activity stopped")
          }}>
            <Pause />
          </Button>
        </CardFooter>
      </Card>
      {linkedItem && (<>
        <h2 className="text-base font-semibold -mb-2.5">Related work item</h2>
        <Card key={linkedItem.id}>
          <Link to="/projects/$projectId" params={{ projectId: linkedItem.id }} key={linkedItem.id} className="no-underline">
            <CardHeader>
              <CardDescription>{getPath(items, activityRow.activity.workItemId)}</CardDescription>
              <CardTitle>{linkedItem?.title}</CardTitle>
              <TagList>
                <StatusTag status="In progress" textColor="text-yellow-800" backgroundColor="bg-yellow-100" />
              </TagList>
            </CardHeader>
          </Link>
          <CardContent>{linkedItem.description}</CardContent>
          <CardFooter className="flex flex-row gap-2 items-stretch h-20">
            <Button variant="default" className="flex-1 flex h-full [&_svg]:size-6!" onClick={() => window.alert("Not implemented yet!")}>
              <CircleCheckBig />
              <span>Mark as done</span>
            </Button>
          </CardFooter>
        </Card>
      </>)}
      <Sessions activityRow={activityRow} />
    </div>
  </TitleBarLayout>
}

function Sessions({ activityRow }: { activityRow: ActivityWithSessions }) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])

  const { deleteActivitySessions } = useActivityActions()
  const { showToast } = useToast()

  const now = useNow()

  const sessionGroups = groupSessionsByStartDay(activityRow.sessions)

  const openSessionEditor = (session?: ActivitySession) => {
    NiceModal.show(SessionEditorModal, { activityId: activityRow.activity.id, session })
  }

  const toggleSelectionMode = () => {
    setSelectionMode((enabled) => !enabled)
    setSelectedSessionIds([])
  }

  const removeSessions = async (sessionIds: string[]) => {
    await new Promise<void>((resolve) => {
      NiceModal.show(DeleteSessionsConfirmationModal, { sessionIds, onConfirm: resolve })
    })

    setSelectedSessionIds([])
    setSelectionMode(false)
    await deleteActivitySessions(activityRow.activity.id, sessionIds)
    showToast(sessionIds.length === 1 ? "Session deleted" : "Sessions deleted")
  }

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds((selected) => selected.includes(sessionId)
      ? selected.filter((id) => id !== sessionId)
      : [...selected, sessionId])
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Sessions</h2>
          <p className="text-sm text-muted-foreground">{activityRow.sessions.length} recorded</p>
        </div>
        <div className="flex items-center gap-2">
          {selectionMode && (
            <>
              <span className="text-sm text-muted-foreground">{selectedSessionIds.length} selected</span>
              <Button
                variant="destructive"
                size="icon"
                aria-label="Delete selected sessions"
                title="Delete selected sessions"
                disabled={selectedSessionIds.length === 0}
                onClick={() => void removeSessions(selectedSessionIds)}
              >
                <Trash2 />
              </Button>
            </>
          )}
          <Button variant="outline" onClick={toggleSelectionMode}>
            {selectionMode ? "Done" : "Select"}
          </Button>
          <Button variant="default" onClick={() => openSessionEditor()}>
            <Plus />
            <span>Add session</span>
          </Button>
        </div>
      </div>
      {sessionGroups.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No sessions recorded yet.</p>
      ) : sessionGroups.map((group) => (
        <div key={group.dayKey} className="space-y-2">
          <h3 className="border-b pb-1 text-sm font-medium">{formatSessionDay(group.timestamp, now)}</h3>
          <div className="space-y-2">
            {group.sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader className="pb-2">
                  <div className="flex min-w-0 items-center gap-2 pr-10">
                    {selectionMode && (
                      <input
                        type="checkbox"
                        aria-label="Select session"
                        checked={selectedSessionIds.includes(session.id)}
                        onChange={() => toggleSessionSelection(session.id)}
                      />
                    )}
                    <CardTitle className="text-sm">Tracked session</CardTitle>
                  </div>
                  <CardAction>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More session options" title="More session options">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openSessionEditor(session)}>
                          <Pencil />
                          Edit session
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => void removeSessions([session.id])}>
                          <Trash2 />
                          Delete session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <SessionTime label="Start" value={formatSessionTime(session.startAt)} />
                  <SessionTime
                    label="End"
                    value={session.endAt === null
                      ? "In progress"
                      : formatSessionEnd(session.startAt, session.endAt)}
                  />
                  <SessionTime
                    label="Duration"
                    value={formatDuration((session.endAt ?? now) - session.startAt)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

function SessionTime({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
    </div>
  )
}

const SessionEditorModal = NiceModal.create(({
  activityId,
  session,
}: {
  activityId: string
  session?: ActivitySession
}) => {
  const { addActivitySession, updateActivitySession } = useActivityActions()
  const { showToast } = useToast()
  const modal = useModal()
  const { visible, close } = simpleModalHandler(modal)
  const form = useForm({
    defaultValues: {
      startAt: toDateTimeLocalValue(session?.startAt ?? Date.now() - 60 * 60 * 1000),
      endAt: session
        ? session.endAt === null ? "" : toDateTimeLocalValue(session.endAt)
        : toDateTimeLocalValue(Date.now()),
    }
  })

  const saveSession = useCallback(async () => {
    const startTimestamp = new Date(form.getValues("startAt")).getTime()
    const endTimestamp = form.getValues("endAt") ? new Date(form.getValues("endAt")).getTime() : null

    if (!Number.isFinite(startTimestamp) || (endTimestamp !== null && (!Number.isFinite(endTimestamp) || endTimestamp < startTimestamp))) {
      showToast("End time must be after start time")
      return
    }

    try {
      if (session) {
        await updateActivitySession(activityId, session.id, { startAt: startTimestamp, endAt: endTimestamp })
        showToast("Session updated")
      } else {
        await addActivitySession(activityId, { startAt: startTimestamp, endAt: endTimestamp })
        showToast("Session added")
      }
      close()
    } catch {
      showToast("Unable to save session")
    }
  }, [form, session, activityId, addActivitySession, updateActivitySession, showToast, close])

  return (
    <ModalView
      height="medium"
      show={visible}
    >
      <TitleBarLayout titleBarContent={<DefaultTitleBarContent title={session ? "Edit session" : "New session"} leftIcons={
        <Button variant="ghost" aria-label="Close" className="[&_svg]:size-6! text-primary" onClick={close}>
          <X />
        </Button>
      } rightIcons={
        <Button variant="ghost" aria-label="Save" className="[&_svg]:size-6! text-primary" onClick={saveSession}>
          <Check />
        </Button>
      } />}>
        <div className="p-5">
          <form id="activity-session-form" onSubmit={(e) => { e.preventDefault(); saveSession(); }}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="session-start">Start time</FieldLabel>
                <Input id="session-start" type="datetime-local" required {...form.register("startAt")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="session-end">End time</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="session-end" type="datetime-local" {...form.register("endAt")} />
                  <InputGroupButton onClick={() => form.setValue("endAt", "")}>
                    <CircleX className={form.watch("endAt") !== "" ? "text-primary" : "text-muted-foreground"} />
                  </InputGroupButton>
                </InputGroup>
                <FieldDescription>Leave blank for a session that is still running.</FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </TitleBarLayout>
    </ModalView>
  )
})

function TitleBarContent({ onDeleteActivity }: { onDeleteActivity: () => void }) {
  return <DefaultTitleBarContent title="Activity details" rightIcons={
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary">
          <CircleEllipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem variant="destructive" onClick={onDeleteActivity}>
          <Trash2 />
          Delete activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  } />
}

const EditActivityModal = NiceModal.create(({ activity }: { activity: Activity }) => {
  const { updateActivity } = useActivityActions()
  const { showToast } = useToast()

  const form = useForm({
    defaultValues: {
      title: activity.title,
      tags: activity.tags.join(", "),
    },
  })

  const modal = useModal()
  const { visible, close } = simpleModalHandler(modal)

  function handleSave() {
    close();
    updateActivity(activity.id, {
      title: form.getValues("title"),
      tags: form.getValues("tags").split(",").map(tag => tag.trim()),
    })
    showToast("Activity updated")
  }

  return (
    <ModalView height="medium" show={visible}>
      <TitleBarLayout titleBarContent={<DefaultTitleBarContent title="Edit activity" leftIcons={<>
        <Button variant="ghost" aria-label="Close" className="[&_svg]:size-6! text-primary" onClick={close}>
          <X />
        </Button>
      </>} rightIcons={<>
        <Button variant="ghost" aria-label="Settings" className="[&_svg]:size-6! text-primary" onClick={handleSave}>
          <Check />
        </Button>
      </>} />} >
        <div className="p-5">
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input placeholder="Doing homework" {...form.register("title")} />
                <FieldDescription>Optional title for the activity.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <Input {...form.register("tags")} />
                <FieldDescription>Seperate tags with a comma.</FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </TitleBarLayout>
    </ModalView>
  )
})

const DeleteActivityConfirmationModal = NiceModal.create(({ activityId }: { activityId: string }) => {
  const { showToast } = useToast()
  const modal = useModal()
  const { visible, close } = simpleModalHandler(modal)

  return (
    <ConfirmationModal
      prompt="Are you sure you want to delete this activity?"
      buttons={[
        {
          label: "Delete", variant: "destructive", onClick: () => {
            close()
            showToast(`Deletion logic not implemented yet (${activityId})`)
          }
        },
        { label: "Cancel", onClick: () => close() }
      ]}
      show={visible}
    />
  )
})

const DeleteSessionsConfirmationModal = NiceModal.create(({ sessionIds, onConfirm }: { sessionIds: string[], onConfirm: () => void }) => {
  const modal = useModal()
  const { visible, close } = simpleModalHandler(modal)

  return (
    <ConfirmationModal
      prompt={`Are you sure you want to delete ${sessionIds.length == 1 ? "this session" : `${sessionIds.length} sessions`}?`}
      buttons={[
        {
          label: "Delete", variant: "destructive", onClick: () => {
            close()
            onConfirm()
          }
        },
        { label: "Cancel", onClick: () => close() }
      ]}
      show={visible}
    />
  )
})
