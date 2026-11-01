import TitleBar from "@/components/TitleBar";
import useScrollPosition from "@/hooks/useScrollPosition";
import { cn } from "@/lib/utils";

export default function TitleBarLayout({ children, titleBarContent, hide, hideable }: { children?: React.ReactNode, titleBarContent?: React.ReactNode, hide?: boolean, hideable?: boolean }) {
  const scrollPosition = useScrollPosition()
    
  return <div>
    <div className={cn(
      hideable ? "fixed" : "fixed z-10",
      "top-0 left-0 right-0 transition-all duration-300 ease-in-out",
      hideable ? (hide ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100") : "",
    )}>
      <TitleBar showBorder={scrollPosition > 0}>{titleBarContent}</TitleBar>
    </div>
    <div className={cn("flex-1", hideable ? "" : "pt-13")}>
      {children}
    </div>
  </div>
}