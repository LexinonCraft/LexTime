import { useCallback, useEffect, useState } from "react";

export default function useOnScreen(): [boolean, React.Ref<HTMLElement | null>] {

  const [isIntersecting, setIntersecting] = useState(false)

  const [node, setNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting)
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  const ref = useCallback((node: HTMLElement | null) => {
    setNode(node)
  }, [])

  return [isIntersecting, ref as React.Ref<HTMLElement | null>]
}
