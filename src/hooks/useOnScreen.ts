import { useCallback, useEffect, useState } from "react";

export default function useOnScreen(): [boolean, boolean, React.Ref<HTMLElement | null>] {
  const [isOnScreen, setOnScreen] = useState(false)
  const [ready, setReady] = useState(false)

  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    return () => observer?.disconnect()
  }, [observer])

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting)
        setReady(true)
      }
    )
    observer.observe(node)
    setObserver(observer)
  }, [])

  return [isOnScreen, ready, ref as React.Ref<HTMLElement | null>]
}
