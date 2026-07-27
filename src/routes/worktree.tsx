import TitleBarLayout from '@/layouts/TitleBarLayout'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/button';
import { Check, Plus, Search, X } from 'lucide-react';
import useOnScreen from '@/hooks/useOnScreen'
import Title from '@/components/Title';
import type { WorkItemStatus } from '@/types/domain';
import ModalView from '@/components/ModalView';
import DefaultTitleBarContent from '@/components/DefaultTitleBarContent';

export const Route = createFileRoute('/worktree')({
    component: RouteComponent,
})

function titleBarRightIcons(openNewWorkItemModal: () => void) {
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
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary" onClick={openNewWorkItemModal}>
            <Plus />
        </Button>
    </>
}

function modalTitleBarLeftIcons(closeModal: () => void) {
    return <>
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary" onClick={closeModal}>
            <X />
        </Button>
    </>
}

function modalTitleBarRightIcons(closeModal: () => void) {
    return <>
        <Button variant="ghost" className="[&_svg]:!size-6 text-primary" onClick={closeModal}>
            <Check />
        </Button>
    </>
}

function RouteComponent() {
    const titleRef = useRef<HTMLElement>(null)
    const titleOnScreenRaw = useOnScreen(titleRef)
    const titleOnScreen = titleRef.current != null ? titleOnScreenRaw : true

    const [showModal, setShowModal] = useState(false)

    return <TitleBarLayout titleBarContent={<DefaultTitleBarContent title="Worktree" rightIcons={titleBarRightIcons(() => setShowModal(true))} />} hide={titleOnScreen} hideable>
        <ModalView height="medium" show={showModal} showTitleBar title="New work item" leftIcons={modalTitleBarLeftIcons(() => setShowModal(false))} rightIcons={modalTitleBarRightIcons(() => setShowModal(false))}>
            <div className="p-3">
                Lorem ipsum dolor sit amet<br/>
                Lorem ipsum dolor sit amet<br/>
                Lorem ipsum dolor sit amet<br/>
                Lorem ipsum dolor sit amet<br/>
                <Button variant="outline" onClick={() => setShowModal(false)}>Close modal</Button><br/>
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
        </ModalView>
        <div className="p-3">
            {/*<h1 className="text-3xl font-bold" ref={titleRef as Ref<HTMLHeadingElement | null>}>Worktree</h1>*/}
            <Title title="Worktree" rightIcons={titleBarRightIcons(() => setShowModal(true))} ref={titleRef as Ref<HTMLHeadingElement | null>} />
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            <Link to="/projects">Projects page</Link><br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            Lorem ipsum dolor sit amet<br/>
            <Button variant="outline" onClick={() => setShowModal(true)}>Open modal</Button><br/>
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
