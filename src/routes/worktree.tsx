import TitleBarLayout from '@/layouts/TitleBarLayout'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, type Ref } from 'react'
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import useOnScreen from '@/hooks/useOnScreen'
import Title from '@/components/Title';
import type { WorkItemStatus } from '@/types/domain';

export const Route = createFileRoute('/worktree')({
    component: RouteComponent,
})

function titleBarRightIcons() {
    const filter = {
        query: "",
        status: "all" as "all" | WorkItemStatus,
        tag: "",
        maxDepth: 0,
    }
    return <>
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary">
            <Link to="/projects/filter" search={filter}>
                <Search />
            </Link>
        </Button>
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary">
            <Link to="/projects/create">
                <Plus />
            </Link>
        </Button>
    </>
}

function RouteComponent() {
    const titleRef = useRef<HTMLElement>(null)
    const titleOnScreenRaw = useOnScreen(titleRef)
    const titleOnScreen = titleRef.current != null ? titleOnScreenRaw : true

    return <TitleBarLayout title="Worktree" hide={titleOnScreen} hideable rightIcons={titleBarRightIcons()}>
        <div className="p-3">
            {/*<h1 className="text-3xl font-bold" ref={titleRef as Ref<HTMLHeadingElement | null>}>Worktree</h1>*/}
            <Title title="Worktree" rightIcons={titleBarRightIcons()} ref={titleRef as Ref<HTMLHeadingElement | null>} />
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            <Link to="/projects">Projects page</Link><br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
        </div>
    </TitleBarLayout>
}
