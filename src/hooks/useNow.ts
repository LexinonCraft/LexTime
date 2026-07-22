import { useEffect, useState } from "react"

export function useNow(refreshMs = 1_000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, refreshMs)

    return () => window.clearInterval(timer)
  }, [refreshMs])

  return now
}
