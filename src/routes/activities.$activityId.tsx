import { useCallback, useEffect, useMemo, useState } from "react"
import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Check, CircleCheckBig, CircleEllipsis, Ellipsis, Pause, Pencil, Plus, StepForward, Trash2, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

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
import { useToast } from "@/components/ui/toast"
import { type ActivityWithSessions, useActivity, useActivityActions } from "@/hooks/useActivities"
import { useNow } from "@/hooks/useNow"
import { useWorkItems } from "@/hooks/useWorkItems"
import TitleBarLayout from "@/layouts/TitleBarLayout"
import { formatDuration, formatRelativeTime, getElapsedMs } from "@/lib/time"
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
            <Button variant="default" className="flex-1 flex h-full [&_svg]:size-6!">
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

  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), [])

  const sessionGroups = groupSessionsByStartDay(activityRow.sessions)

  const openSessionEditor = (session?: ActivitySession) => {
    NiceModal.show(SessionEditorModal, { activityId: activityRow.activity.id, session })
  }

  const toggleSelectionMode = () => {
    setSelectionMode((enabled) => !enabled)
    setSelectedSessionIds([])
  }

  const removeSessions = async (sessionIds: string[]) => {
    if (!window.confirm(`Delete ${sessionIds.length === 1 ? "this session" : `${sessionIds.length} sessions`}?`)) {
      return
    }

    await deleteActivitySessions(activityRow.activity.id, sessionIds)
    setSelectedSessionIds([])
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

function groupSessionsByStartDay(sessions: ActivitySession[]) {
  const groups = new Map<string, { dayKey: string; timestamp: number; sessions: ActivitySession[] }>()

  for (const session of [...sessions].sort((first, second) => second.startAt - first.startAt)) {
    const dayKey = getLocalDayKey(session.startAt)
    const group = groups.get(dayKey) ?? { dayKey, timestamp: session.startAt, sessions: [] }
    group.sessions.push(session)
    groups.set(dayKey, group)
  }

  return [...groups.values()]
}

function getLocalDayKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function formatSessionDay(timestamp: number, now: number): string {
  const date = new Date(timestamp)
  const today = new Date(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (getLocalDayKey(timestamp) === getLocalDayKey(today.getTime())) return "Today"
  if (getLocalDayKey(timestamp) === getLocalDayKey(yesterday.getTime())) return "Yesterday"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date)
}

function formatSessionTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestamp)
}

function formatSessionEnd(startAt: number, endAt: number): string {
  if (getLocalDayKey(startAt) !== getLocalDayKey(endAt)) {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(endAt)
  }
  return formatSessionTime(endAt)
}

function toDateTimeLocalValue(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const SessionEditorModal = NiceModal.create(({
  activityId,
  session,
}: {
  activityId: string
  session?: ActivitySession
}) => {
  const { addActivitySession, updateActivitySession } = useActivityActions()
  const [startAt, setStartAt] = useState(() => toDateTimeLocalValue(session?.startAt ?? Date.now() - 60 * 60 * 1000))
  const [endAt, setEndAt] = useState(() => session
    ? session.endAt === null ? "" : toDateTimeLocalValue(session.endAt)
    : toDateTimeLocalValue(Date.now()))
  const { showToast } = useToast()
  const modal = useModal()
  const { visible, close } = simpleModalHandler(modal)

  const saveSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const startTimestamp = new Date(startAt).getTime()
    const endTimestamp = endAt ? new Date(endAt).getTime() : null

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
  }

  return (
    <ModalView
      height="medium"
      show={visible}
    >
      <TitleBarLayout titleBarContent={<EditActivityModalTitleBarContent onClick={() => { close(); }} />}>
        <div className="p-5">
          <form id="activity-session-form" onSubmit={(event) => void saveSession(event)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="session-start">Start time</FieldLabel>
                <Input id="session-start" type="datetime-local" required value={startAt} onChange={(event) => setStartAt(event.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="session-end">End time</FieldLabel>
                <Input id="session-end" type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
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

function EditActivityModalTitleBarContent({ onClick: onClick }: { onClick: () => void }) {
  return <DefaultTitleBarContent title="Edit activity" leftIcons={<>
    <Button variant="ghost" aria-label="Close" className="[&_svg]:size-6! text-primary" onClick={onClick}>
      <X />
    </Button>
  </>} rightIcons={<>
    <Button variant="ghost" aria-label="Settings" className="[&_svg]:size-6! text-primary" onClick={onClick}>
      <Check />
    </Button>
  </>} />
}

const EditActivityModal = NiceModal.create(({ activity, modalCounter }: { activity: Activity, modalCounter: number }) => {
  const { updateActivity } = useActivityActions()

  const form = useForm({
    defaultValues: {
      title: activity.title,
      tags: activity.tags.join(", "),
    },
  });
  const { register } = form

  const reset = useCallback(() => {
    form.reset({
      title: activity.title,
      tags: activity.tags.join(", "),
    })
  }, [activity, form])

  useEffect(() => {
    reset()
  }, [modalCounter, reset])

  const modal = useModal()
  const { visible, close } = simpleModalHandler(modal)

  function handleSave() {
    close();
    updateActivity(activity.id, {
      title: form.getValues("title"),
      tags: form.getValues("tags").split(",").map(tag => tag.trim()),
    });
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
              <Controller
                name="title"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input placeholder="Doing homework" {...field} />
                    <FieldDescription>Optional title for the activity.</FieldDescription>
                  </Field>
                )} />
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <Input {...register("tags")} />
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
        { label: "Delete", variant: "destructive", onClick: () => {
          close()
          showToast(`Deletion logic not implemented yet (${activityId})`)
        } },
        { label: "Cancel", onClick: () => close() }
      ]}
      show={visible}
    />
  )
})
