"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    // Force scroll to top immediately when pathname changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    // Also force it after a small delay to ensure it takes effect
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
} 