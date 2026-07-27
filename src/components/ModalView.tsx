import { cn } from "@/lib/utils"
import DefaultTitleBarContent from "./DefaultTitleBarContent"

export type ModalViewHeight = "small" | "medium" | "large"

// TODO: prevent scrolling of the background when the modal is open

export default function ModalView({ children, height, show, showTitleBar, title, leftIcons, rightIcons }: {
            children?: React.ReactNode,
            height: ModalViewHeight,
            show: boolean,
            showTitleBar?: boolean,
            title?: string,
            leftIcons?: React.ReactNode,
            rightIcons?: React.ReactNode
        }
    ) {
    return <>
        <div className={cn(
            "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out",
            show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} />
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-51 pb-4 bg-background rounded-lg max-w-lg w-full transition-transform duration-300 ease-in-out",
            "flex flex-col justify-start overflow-hidden",
            show ? "translate-y-0" : "translate-y-full",
            height === "small" ? "h-3/8" : height === "medium" ? "h-11/16" : "h-7/8"
        )}>
            {showTitleBar && <DefaultTitleBarContent title={title ?? ""} leftIcons={leftIcons} rightIcons={rightIcons} />}
            <div className="overflow-scroll flex-1">
                {children}
            </div>
        </div>
    </>
}
