import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActivityState } from "@/types/domain";

interface ActivityProps {
    title: string
    subtitle: string
    tags: string[]
    state: ActivityState
    detailTo?: string
    onToggleRunning?: () => void | Promise<void>
}

export default function Activity({
    title,
    subtitle,
    tags,
    state,
    detailTo,
    onToggleRunning,
}: ActivityProps) {
    return <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
            {tags.length === 0 && <span className="text-muted-foreground">No tags</span>}
            {tags.map((tag) => <span key={tag} className="bg-secondary text-secondary-foreground inline rounded-md px-2 py-1 text-xs">{tag}</span>)}
            </div>
        </CardContent>
        <CardFooter className="flex gap-2">
            {detailTo && (
                <Button className="flex-1" variant="outline" asChild>
                    <a href={detailTo}>Details</a>
                </Button>
            )}
            {onToggleRunning && (
                <Button className="flex-1" variant={state === "running" ? "destructive" : "default"} onClick={onToggleRunning}>
                    {state === "running" ? "Stop" : "Start"}
                </Button>
            )}
        </CardFooter>
    </Card>
}