import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronDown, CircleCheckBig, ClipboardMinus, FilePlus, X } from 'lucide-react'

import { StatusTag, TagList } from '@/components/Tag'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkItems } from '@/hooks/useWorkItems'
import TitleBarLayout from '@/layouts/TitleBarLayout'
import { getPath } from '@/lib/workItems'

export const Route = createFileRoute('/lists')({
  component: RouteComponent,
})

function TitleBarContent() {
  return <div className="flex items-center gap-2 h-full px-2">
    <div className="flex-1">
      <span className="font-semibold">My to-do list</span>
    </div>
    <Button variant="ghost" size="icon" className="[&_svg]:!size-6 text-primary">
      <ChevronDown />
    </Button>
    <Button variant="ghost" size="icon" className="[&_svg]:!size-6 text-primary">
      <X />
    </Button>
  </div>
}

function RouteComponent() {
  const workItems = useWorkItems()
  const rootWorkItems = workItems.filter((item) => item.parentId === null)

  return <TitleBarLayout titleBarContent={<TitleBarContent />}>
    <div className="p-3 flex flex-col gap-3">
      {rootWorkItems.map((item) =>
        <Link to="/projects/$projectId" params={{ projectId: item.id }} key={item.id} className="no-underline">
          <Card key={item.id}>
            <CardHeader>
              <CardDescription>{getPath(workItems, item.id)}</CardDescription>
              <CardTitle>{item.title}</CardTitle>
              <TagList>
                <StatusTag status="In progress" textColor="text-yellow-800" backgroundColor="bg-yellow-100" />
              </TagList>
            </CardHeader>
            <CardContent>{item.description}</CardContent>
            <CardFooter className="flex flex-row gap-2 items-stretch h-20">
              <Button variant="default" className="flex-1 flex h-full [&_svg]:!size-6">
                <CircleCheckBig />
              </Button>
              <Button variant="outline" className="flex-1 flex h-full [&_svg]:!size-6">
                <FilePlus />
              </Button>
              <Button variant="destructive" className="flex-1 flex h-full [&_svg]:!size-6">
                <ClipboardMinus />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      )}
    </div>
  </TitleBarLayout>
}
