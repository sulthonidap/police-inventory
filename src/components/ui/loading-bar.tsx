"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function LoadingBar() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Reset loading state when pathname changes
    setLoading(true)
    setProgress(0)

    // Faster loading progress for better UX
    const timer1 = setTimeout(() => setProgress(30), 50)
    const timer2 = setTimeout(() => setProgress(60), 150)
    const timer3 = setTimeout(() => setProgress(90), 250)
    const timer4 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setLoading(false), 100)
    }, 350)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Clean Progress Bar with Moving Line */}
      <div className="h-1 bg-gradient-to-r from-blue-50 to-blue-100 relative overflow-hidden">
        {/* Main Progress Bar */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
        
        {/* Moving Shimmer Line */}
        <div className="absolute inset-0">
          <div className="h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
