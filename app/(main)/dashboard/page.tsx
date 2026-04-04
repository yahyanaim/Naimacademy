"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Award, BookOpen, FileQuestion, Lock } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { SupportChat } from "@/components/course/support-chat"

interface ExamAttempt {
  score: number
  passed: boolean
  submittedAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  examAttempts: ExamAttempt[]
}

interface ProgressData {
  completedLessons: string[]
  completionPercentage: number
  lastLessonId?: string
}

interface CertificateData {
  userName: string
  courseName: string
  completionDate: string
  certificateIssued: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch("/api/auth/me")
        if (!meRes.ok) {
          router.push("/login")
          return
        }
        const meData = await meRes.json()
        setUser(meData.user)

        if (meData.user.role === "admin") {
          router.push("/admin")
          return
        }

        const [progressRes, certRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/certificate"),
        ])

        if (progressRes.ok) {
          const data = await progressRes.json()
          setProgress(data.progress)
        }

        if (certRes.ok) {
          const data = await certRes.json()
          setCertificate(data)
        }
        // 403 on certificate = not passed; handled gracefully by leaving certificate null
      } catch (err) {
        console.error("[DashboardPage] Failed to fetch data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const completionPct = progress?.completionPercentage ?? 0
  const completedCount = progress?.completedLessons?.length ?? 0
  const latestAttempt =
    user.examAttempts.length > 0
      ? user.examAttempts[user.examAttempts.length - 1]
      : null
  const examPassed = !!certificate

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Course Progress */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Course Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{completionPct}% complete</span>
              <span className="text-muted-foreground">{completedCount} lessons done</span>
            </div>
            <Progress value={completionPct} />

            <Button render={<Link href="/course" />} variant="outline" size="sm" className="mt-auto">
              Continue Learning
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Exam */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileQuestion className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Exam</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            {latestAttempt ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latest score</span>
                  <span className="text-sm font-semibold">{latestAttempt.score}%</span>
                </div>
                <Badge
                  variant={latestAttempt.passed ? "default" : "destructive"}
                  className="w-fit"
                >
                  {latestAttempt.passed ? "Passed" : "Failed"}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not attempted yet</p>
            )}

            {completionPct < 100 && (
              <p className="text-xs text-muted-foreground border rounded-md px-3 py-2">
                Complete the course first to unlock the exam.
              </p>
            )}

            <Button
              render={<Link href="/exam" />}
              variant="outline"
              size="sm"
              className="mt-auto"
              disabled={completionPct < 100}
            >
              {latestAttempt ? "Retake Exam" : "Take Exam"}
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Certificate */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Certificate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            {examPassed ? (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Certificate Available</p>
                  <p className="text-xs text-muted-foreground">
                    You&apos;ve successfully completed the course.
                  </p>
                </div>
                <Button render={<Link href="/certificate" />} size="sm" className="mt-auto">
                  Download Certificate
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Lock className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Pass the exam to unlock your certificate.
                  </p>
                </div>
                <Button size="sm" disabled className="mt-auto">
                  Locked
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Support Chat */}
      <SupportChat />
    </div>
  )
}
