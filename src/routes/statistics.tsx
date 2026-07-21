import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/statistics')({
  component: RouteComponent,
})

function RouteComponent() {
    return <div className="p-3">
        <h1 className="text-3xl font-bold mb-5">Statistics</h1>
        <Card>
            <CardHeader>
                <CardTitle>Welcome to your statistics page</CardTitle>
                <CardDescription>Here you can view your statistics.</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full">Proceed</Button>
            </CardFooter>
        </Card>
    </div>
}
