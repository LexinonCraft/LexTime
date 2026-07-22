import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActivityState } from "@/types/domain";
import { Link } from "@tanstack/react-router";

interface ActivityProps {
    id?: string
    title: string
    subtitle: string
    tags: string[]
    state: ActivityState
    onToggleRunning?: () => void | Promise<void>
}

export default function Activity({
    id,
    title,
    subtitle,
    tags,
    state,
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
            {id && (
                <Button className="flex-1" variant="outline" asChild>
                    <Link to={`/activities/$activityId`} params={{ activityId: id }}>Details</Link>
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