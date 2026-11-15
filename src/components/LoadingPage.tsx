import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import useBack from "@/hooks/useBack";
import TitleBarLayout from "@/layouts/TitleBarLayout";

import DefaultTitleBarContent from "./DefaultTitleBarContent";

export default function LoadingPage() {
  const back = useBack()

  return (
    <TitleBarLayout titleBarContent={
      <DefaultTitleBarContent
        title={null}
        leftIcons={
          <Button variant="ghost" aria-label="Back" className="[&_svg]:!size-6 text-primary" onClick={back}>
            <ChevronLeft />
          </Button>
        }
      />
    }>
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    </TitleBarLayout>
  )
}