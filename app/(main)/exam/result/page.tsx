"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ExamResult } from "@/components/exam/exam-result"
import { Button } from "@/components/ui/button"

export default function ExamResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const scoreParam = searchParams.get("score")
  const passedParam = searchParams.get("passed")
  const totalParam = searchParams.get("total")
  const correctParam = searchParams.get("correct")

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/exam/results/latest")
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error("Failed to fetch latest results", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground animate-pulse">Loading your results...</p>
      </div>
    )
  }

  // Use fetched data or fallback to URL params
  const score = data?.score ?? Number(scoreParam ?? 0)
  const passed = data?.passed ?? (passedParam === "true")
  const total = data?.total ?? Number(totalParam ?? 0)
  const correct = data?.correct ?? Number(correctParam ?? 0)
  const results = data?.results ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">
      <ExamResult 
        score={score} 
        passed={passed} 
        total={total} 
        correct={correct} 
        results={results}
      />
      <div className="flex justify-center">
        <Button render={<Link href="/dashboard" />} variant="ghost">
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
