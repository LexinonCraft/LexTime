import { cn } from "@/lib/utils"

export function Hashtag({ tag }: { tag: string }) {
    return (
        <span key={tag} className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground">#{tag}</span>
    )
}

export function StatusTag({ status, textColor, backgroundColor }: { status: string, textColor?: string, backgroundColor?: string }) {
    const customStyle = cn(textColor || "text-secondary-foreground", backgroundColor || "bg-secondary")
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1", customStyle)}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {status}
        </span>
    )
}

export function TagList({ children }: { children?: React.ReactNode }) {
    return (
        <div className="flex flex-wrap gap-2 text-xs">{children}</div>
    )
}