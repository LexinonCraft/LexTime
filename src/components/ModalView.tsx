import { useEffect, useState } from "react"
import type { NiceModalHandler } from "@ebay/nice-modal-react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import DefaultTitleBarContent from "./DefaultTitleBarContent"
import { Button, type buttonVariants } from "./ui/button"

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
  const [animatedShow, setAnimatedShow] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimatedShow(show))
    return () => cancelAnimationFrame(id)
  }, [show])

  return <>
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out",
      animatedShow ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )} />
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-51 pb-4 bg-background rounded-t-lg w-full transition-transform duration-300 ease-in-out",
      "flex flex-col justify-start overflow-hidden",
      animatedShow ? "translate-y-0" : "translate-y-full",
      height === "small" ? "h-3/8" : height === "medium" ? "h-11/16" : "h-7/8"
    )}>
      {showTitleBar && <DefaultTitleBarContent title={title ?? ""} leftIcons={leftIcons} rightIcons={rightIcons} />}
      <div className="overflow-scroll flex-1">
        {children}
      </div>
    </div>
  </>
}

export function simpleModalHandler(modal: NiceModalHandler) {
  return {
    visible: modal.visible,
    close: async () => {
      modal.hide()
      await new Promise(resolve => setTimeout(resolve, 300)) // wait for modal hide animation to complete
      modal.remove()
    }
  }
}

export function ConfirmationModal({ prompt, buttons, show }: { prompt: string, buttons: { label: string, variant?: VariantProps<typeof buttonVariants>["variant"], onClick: () => void }[], show: boolean }) {
  return (
    <ModalView height="small" show={show}>
      <div className="p-3 flex flex-col justify-evenly h-full">
        <div className="py-10">
          <p className="text-center font-bold text-xl">{prompt}</p>
        </div>
        <div className="flex flex-col justify-center gap-3">
          {buttons.map((button, index) => (
            <Button key={index} variant={button.variant ?? "secondary"} className="p-5" onClick={button.onClick}>
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </ModalView>
  )
}
