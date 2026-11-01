import { cn } from "@/lib/utils";

export default function TitleBar({ children, showBorder }: { children?: React.ReactNode, showBorder?: boolean }) {
  return <div className={cn("w-full h-13 bg-background", showBorder ? "border-b" : "border-b-0")}>
    {children}
  </div>
}