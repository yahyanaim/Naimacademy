"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, ChevronRight, BookOpen, Calendar, MapPin, Share2, Link2 } from "lucide-react"
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

function ShareButtons({ cert }: { cert: Certification }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://naimacademy.com"
  const formattedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const ogParams = new URLSearchParams({
    name: cert.studentName,
    course: cert.courseTitle,
    score: cert.score.toString(),
    date: formattedDate,
  })
  const certificateUrl = `${baseUrl}/certificate/${cert.certificationId}`
  const ogImageUrl = `${baseUrl}/api/og/certificate?${ogParams.toString()}`
  const shareText = `I just earned my ${cert.courseTitle} certificate from Naim Academy with a score of ${cert.score}%! 🎉`

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(certificateUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + certificateUrl)}`,
  }

  const copyLink = () => {
    navigator.clipboard.writeText(certificateUrl)
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Share2 className="size-3" />
        Share:
      </span>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        title="Share on X"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-colors"
        title="Share on Facebook"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-colors"
        title="Share on LinkedIn"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
        title="Share on WhatsApp"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
      <button
        onClick={copyLink}
        className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        title="Copy link"
      >
        <Link2 className="size-4 text-muted-foreground" />
      </button>
    </div>
  )
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
                    className="w-full"
                  >
                    View Certificate
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                  <ShareButtons cert={cert} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
