"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, Clock, FileQuestion } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ExamMeta {
  title: string
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
}

interface Progress {
  completionPercentage: number
}

export default function ExamPage() {
  const [examMeta, setExamMeta] = useState<ExamMeta | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [examRes, progressRes] = await Promise.all([
          fetch("/api/exam"),
          fetch("/api/progress"),
        ])

        if (examRes.ok) {
          const data = await examRes.json()
          setExamMeta(data)
        }

        if (progressRes.ok) {
          const data = await progressRes.json()
          setProgress(data.progress)
        }
      } catch (err) {
        console.error("[ExamPage] Failed to fetch data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const completionPercentage = progress?.completionPercentage ?? 0
  const canStart = completionPercentage === 100

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading exam info...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Final Exam</h1>
        <p className="text-muted-foreground text-sm">
          Complete the exam to earn your certificate.
        </p>
      </div>

      {examMeta && (
        <Card>
          <CardHeader>
            <CardTitle>{examMeta.title}</CardTitle>
            <CardDescription>Review the exam details below before starting.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <FileQuestion className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Questions</span>
                  <span className="text-sm font-medium">{examMeta.questionCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Time Limit</span>
                  <span className="text-sm font-medium">{examMeta.timeLimitMinutes} minutes</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Badge variant="outline" className="text-xs">
                  Pass
                </Badge>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Passing Score</span>
                  <span className="text-sm font-medium">{examMeta.passingScore}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Instructions</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-1">
                <li>Answer all questions before submitting.</li>
                <li>The timer starts as soon as the exam begins.</li>
                <li>You can navigate between questions at any time.</li>
                <li>The exam will auto-submit when the timer reaches zero.</li>
                <li>A score of {examMeta.passingScore}% or above is required to pass.</li>
              </ul>
            </div>

            {!canStart && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <p>Complete all lessons before taking the exam. Your current progress is {completionPercentage}%.</p>
              </div>
            )}

            <Button render={<Link href="/exam/take" />} disabled={!canStart} className="w-full sm:w-auto">
              Start Exam
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
