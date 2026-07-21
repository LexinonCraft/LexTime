import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Activity() {
    const [active, setActive] = useState(false)

    // activity card with example data
    return <Card>
        <CardHeader>
            <CardTitle>Compilerbau Übungsblatt 4</CardTitle>
            <CardDescription>Active for 3 hours yesterday</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="bg-teal-500 text-white inline px-1 py-0.5 rounded-md mx-1">Compilerbau</div>
            <div className="bg-orange-500 text-white inline px-1 py-0.5 rounded-md mx-1">Uni</div>
        </CardContent>
        <CardFooter>
            <Button className={`w-full ${active ? "bg-destructive" : "bg-primary"}`} onClick={() => setActive(!active)}>{active ? "Stop" : "Start"}</Button>
        </CardFooter>
    </Card>
}