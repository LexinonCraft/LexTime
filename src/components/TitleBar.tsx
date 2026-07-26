import { cn } from "@/lib/utils";

export default function TitleBar({ title, leftIcons, rightIcons, h1heading, showBorder }: { title: string, leftIcons?: React.ReactNode, rightIcons?: React.ReactNode, h1heading?: boolean, showBorder?: boolean }) {
    return <div className={cn("w-full h-13 flex items-center flex-row bg-background", showBorder ? "border-b" : "border-b-0")}>
        <div className="flex-1 flex items-center justify-start">
            {leftIcons || <span className="w-6" />}
        </div>
        {h1heading ? <h1 className="text-xl text-center font-semibold">{title}</h1> : <span className="text-xl text-center font-semibold">{title}</span>}
        <div className="flex-1 flex items-center justify-end">
            {rightIcons || <span className="w-6" />}
        </div>
    </div>
}