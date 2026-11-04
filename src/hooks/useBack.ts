import { useCanGoBack } from "@tanstack/react-router"

import { router } from "@/main"
import type { FileRouteTypes } from "@/routeTree.gen"

export default function useBack(defaultLink?: FileRouteTypes["to"]) {
  const canGoBack = useCanGoBack()

  return () => {
    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ to: defaultLink ?? "/", replace: true })
    }
  }
}
