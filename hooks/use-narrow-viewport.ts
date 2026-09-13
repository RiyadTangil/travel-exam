import { useState, useEffect } from "react"

/**
 * Hook to detect if the viewport is narrow based on a media query.
 * Default breakpoint is 660px as used in the expenses history page.
 */
export function useNarrowViewport(breakpoint = 660) {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const apply = () => setIsNarrow(mq.matches)
    
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [breakpoint])

  return isNarrow
}
