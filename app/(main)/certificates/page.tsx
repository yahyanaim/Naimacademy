"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, ChevronRight, BookOpen, Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Certification {
  certificationId: string
  examId: string
  examTitle: string
  courseId: string
  courseTitle: string
  studentName: string
  score: number
  issuedAt: string
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCerts() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const json = await res.json()
          setCerts(json.user.certifications || [])
        }
      } catch (err) {
        console.error("Failed to fetch certificates", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground">View and download your earned certifications.</p>
      </div>

      {certs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Award className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">No certificates yet</p>
              <p className="text-sm text-muted-foreground">Complete and pass an exam to earn your first certificate.</p>
            </div>
            <Button render={<Link href="/exam/take" />}>
              Take Exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <Card key={cert.certificationId} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="size-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{cert.certificationId}</span>
                </div>
                <CardTitle className="text-xl mt-4">{cert.courseTitle}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                   {cert.examTitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>Issued on {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-semibold text-primary">{cert.score}%</div>
                  </div>
                  <Button 
                    render={<Link href={`/certificate/${cert.certificationId}`} />} 
                    variant="outline" 
                    className="w-full mt-2"
                  >
                    View Certificate
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
