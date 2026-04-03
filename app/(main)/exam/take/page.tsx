"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ExamTimer } from "@/components/exam/exam-timer"
import { QuestionCard } from "@/components/exam/question-card"
import { ExamNavigation } from "@/components/exam/exam-navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Question {
  _id: string
  type: string
  question: string
  options: string[]
}

export default function TakeExamPage() {
  const router = useRouter()
  const [examId, setExamId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function startExam() {
      try {
        const res = await fetch("/api/exam/start", { method: "POST" })
        if (!res.ok) {
          router.push("/exam")
          return
        }
        const data = await res.json()
        setExamId(data.examId)
        setQuestions(data.questions)
        setTimeLimitMinutes(data.timeLimitMinutes)
        setAnswers(new Array(data.questions.length).fill(null))
      } catch (err) {
        console.error("[TakeExamPage] Failed to start exam", err)
        router.push("/exam")
      } finally {
        setLoading(false)
      }
    }

    startExam()
  }, [router])

  const submitExam = useCallback(
    async (finalAnswers: (number | null)[]) => {
      if (!examId || submitting) return
      setSubmitting(true)
      try {
        const res = await fetch("/api/exam/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId,
            answers: questions.map((q, idx) => ({
              questionId: q._id,
              answer: finalAnswers[idx] === null ? -1 : finalAnswers[idx],
            })),
          }),
        })
        if (!res.ok) {
          const errorData = await res.json()
          alert(`Submission failed: ${errorData.details || errorData.error || "Unknown error"}`)
          console.error("[TakeExamPage] Submit failed", errorData)
          return
        }
        const data = await res.json()
        const params = new URLSearchParams({
          score: String(data.score),
          passed: String(data.passed),
          total: String(data.total),
          correct: String(data.correct),
        })
        router.push(`/exam/result?${params.toString()}`)
      } catch (err) {
        console.error("[TakeExamPage] Submit error", err)
      } finally {
        setSubmitting(false)
      }
    },
    [examId, submitting, router, questions]
  )

  function handleAnswer(index: number) {
    setAnswers((prev) => {
      const updated = [...prev]
      updated[currentQuestion] = index
      return updated
    })
  }

  function handleTimeUp() {
    submitExam(answers)
  }

  function handleConfirmSubmit() {
    setConfirmOpen(false)
    submitExam(answers)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading exam...</p>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isFirst = currentQuestion === 0
  const isLast = currentQuestion === questions.length - 1

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6">
      {/* Header row: timer */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Exam</h1>
        <ExamTimer totalMinutes={timeLimitMinutes} onTimeUp={handleTimeUp} />
      </div>

      {/* Question card */}
      {question && (
        <QuestionCard
          key={question._id}
          question={question}
          selectedAnswer={answers[currentQuestion] ?? null}
          onAnswer={handleAnswer}
          questionNumber={currentQuestion + 1}
        />
      )}

      {/* Prev / Next + Submit */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          disabled={isFirst}
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {isLast ? (
            <Button onClick={() => setConfirmOpen(true)} disabled={submitting}>
              Submit Exam
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion((prev) => prev + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Navigation grid */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Jump to question</p>
        <ExamNavigation
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          answers={answers}
          onNavigate={setCurrentQuestion}
        />
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have answered{" "}
              {answers.filter((a) => a !== null).length} of {questions.length}{" "}
              questions. Once submitted, you cannot change your answers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
