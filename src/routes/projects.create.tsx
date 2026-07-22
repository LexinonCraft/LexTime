import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { createWorkItem } from "@/data/repositories/workItemsRepository"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkItems } from "@/hooks/useWorkItems"
import { getFullPath } from "@/lib/workItems"

export const Route = createFileRoute("/projects/create")({
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch() as { parentId?: string }
  const navigate = useNavigate()
  const items = useWorkItems()

  const parent = useMemo(() => {
    if (!search.parentId) {
      return undefined
    }

    return items.find((item) => item.id === search.parentId)
  }, [items, search.parentId])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")

  const onCreate = async () => {
    const trimmed = title.trim()
    if (!trimmed) {
      return
    }

    const created = await createWorkItem({
      title: trimmed,
      description,
      parentId: parent?.id ?? null,
      tags: parseTags(tags),
      status: "todo",
    })

    navigate({ to: "/projects/$projectId", params: { projectId: created.id }, replace: true })
  }

  return (
    <div className="space-y-4 p-3">
      <h1 className="text-3xl font-bold">Create {parent ? "subproject" : "project"}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{parent ? "Create under parent" : "Create root project"}</CardTitle>
          <CardDescription>
            {parent ? `Parent path: ${getFullPath(items, parent.id)}` : "Root projects have no parent."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={title}
            placeholder="Title"
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={description}
            placeholder="Description"
            onChange={(event) => setDescription(event.target.value)}
          />
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3"
            value={tags}
            placeholder="Tags (comma separated)"
            onChange={(event) => setTags(event.target.value)}
          />

          <div className="flex gap-2">
            <Button className="flex-1" onClick={onCreate}>Create</Button>
            <Button className="flex-1" variant="outline" onClick={() => navigate({ to: parent ? "/projects/$projectId" : "/projects", params: parent ? { projectId: parent.id } : undefined, replace: true })}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function parseTags(input: string): string[] {
  return [...new Set(input.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
}
