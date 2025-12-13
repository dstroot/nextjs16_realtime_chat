"use client"

import { useEffect, useState, useCallback } from "react"

interface UseCountdownOptions {
  initialSeconds: number | null
  onComplete?: () => void
}

interface UseCountdownReturn {
  timeRemaining: number | null
  formatted: string
  isExpired: boolean
  isUrgent: boolean
}

function formatTimeRemaining(seconds: number | null): string {
  if (seconds === null) return "--:--"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function useCountdown({
  initialSeconds,
  onComplete,
}: UseCountdownOptions): UseCountdownReturn {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialSeconds)

  // Sync with initial value when it changes
  useEffect(() => {
    if (initialSeconds !== undefined) {
      setTimeRemaining(initialSeconds)
    }
  }, [initialSeconds])

  // Handle countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return

    if (timeRemaining === 0) {
      onComplete?.()
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, onComplete])

  return {
    timeRemaining,
    formatted: formatTimeRemaining(timeRemaining),
    isExpired: timeRemaining === 0,
    isUrgent: timeRemaining !== null && timeRemaining < 60,
  }
}

