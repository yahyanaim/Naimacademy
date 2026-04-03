"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ExamTimerProps {
  totalMinutes: number
  onTimeUp: () => void
}

export function ExamTimer({ totalMinutes, onTimeUp }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const isWarning = secondsLeft <= 5 * 60

  return (
    <div className="flex items-center gap-2">
      <Clock className={cn("size-4", isWarning ? "text-destructive" : "text-muted-foreground")} />
      <Badge
        variant={isWarning ? "destructive" : "outline"}
        className={cn(
          "font-mono text-sm",
          isWarning && "text-destructive"
        )}
      >
        {formatted}
      </Badge>
    </div>
  )
}
