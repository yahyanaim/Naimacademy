"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Question {
  _id: string
  type: string
  question: string
  options: string[]
}

interface QuestionCardProps {
  question: Question
  selectedAnswer: number | null
  onAnswer: (index: number) => void
  questionNumber: number
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  questionNumber,
}: QuestionCardProps) {
  const options =
    question.type === "true-false" ? ["True", "False"] : question.options

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Question {questionNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed">{question.question}</p>
        <RadioGroup
          value={selectedAnswer !== null ? String(selectedAnswer) : ""}
          onValueChange={(val) => onAnswer(Number(val))}
          className="flex flex-col gap-2"
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors cursor-pointer",
                selectedAnswer === index
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
              onClick={() => onAnswer(index)}
            >
              <RadioGroupItem
                value={String(index)}
                id={`${question._id}-option-${index}`}
              />
              <Label
                htmlFor={`${question._id}-option-${index}`}
                className="cursor-pointer font-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
