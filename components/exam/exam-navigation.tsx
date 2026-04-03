"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExamNavigationProps {
  totalQuestions: number
  currentQuestion: number
  answers: (number | null)[]
  onNavigate: (index: number) => void
}

export function ExamNavigation({
  totalQuestions,
  currentQuestion,
  answers,
  onNavigate,
}: ExamNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: totalQuestions }, (_, index) => {
        const isAnswered = answers[index] !== null && answers[index] !== undefined
        const isCurrent = index === currentQuestion

        return (
          <Button
            key={index}
            size="icon-sm"
            variant="outline"
            onClick={() => onNavigate(index)}
            className={cn(
              "size-8 rounded-full text-xs font-medium transition-colors",
              isCurrent && "ring-2 ring-primary ring-offset-1",
              isAnswered
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {index + 1}
          </Button>
        )
      })}
    </div>
  )
}
