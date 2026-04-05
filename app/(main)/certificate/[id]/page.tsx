"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Award, ChevronLeft, ShieldCheck, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamicParams = true

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const certificateRef = useRef<HTMLDivElement>(null)
  const certId = params?.id as string
  
  const [cert, setCert] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(true)

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    async function fetchCert() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const json = await res.json()
          const certs = json.user.certifications || []
          if (certs.length > 0) {
            const found = certs.find((c: Certification) => c.certificationId === certId)
            if (found) {
              setCert(found)
            } else {
              router.push("/certificates")
            }
          } else {
            router.push("/certificates")
          }
        } else {
          router.push("/certificates")
        }
      } catch (err) {
        console.error("Failed to fetch certificate", err)
        router.push("/certificates")
      } finally {
        setLoading(false)
      }
    }
    if (certId) {
      fetchCert()
    } else {
      router.push("/certificates")
    }
  }, [certId, router])

  useEffect(() => {
    if (!loading && cert) {
      const params = new URLSearchParams(window.location.search)
      if (params.get("download") === "true") {
        setTimeout(() => window.print(), 500)
      }
    }
  }, [loading, cert])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!cert) return null

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-4">
      {/* Page header (Hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Certificate Frame */}
      <div className="relative group overflow-hidden">
        <div
          ref={certificateRef}
          id="certificate-content"
          className="certificate-box"
        >
          {/* Decorative Corner Ornaments */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Top Seal */}
          <div className="seal-container">
            <div className="seal-outer">
               <Award className="seal-icon" />
            </div>
            <div className="seal-badge">
               <ShieldCheck className="seal-badge-icon" />
            </div>
          </div>

          {/* Certificate Title */}
          <div className="cert-title">Certificate of Completion</div>

          {/* Presented To */}
          <div className="cert-presented">This certificate is proudly presented to</div>

          {/* Student Name */}
          <div className="cert-name">{cert.studentName}</div>

          {/* Decorative Line */}
          <div className="cert-line" />

          {/* Course Completion Text */}
          <div className="cert-text">
            For successfully completing the course
          </div>

          {/* Course Name */}
          <div className="cert-course">{cert.courseTitle}</div>

          {/* Score */}
          <div className="cert-score">with a score of {cert.score}%</div>

          {/* Date */}
          <div className="cert-date">Issued on {formatDate(cert.issuedAt)}</div>

          {/* Signature */}
          <div className="cert-signature">
            <div className="signature-line" />
            <div className="signature-name">Yahia Naim</div>
            <div className="signature-title">Course Instructor</div>
          </div>

          {/* Barcode */}
          <div className="cert-barcode">
            <div className="barcode-number">{cert.certificationId}</div>
          </div>
        </div>

        {/* Print Button */}
        <div className="print:hidden flex justify-center mt-4">
          <Button onClick={handlePrint} className="gap-2">
            <Download className="size-4" />
            Download / Print
          </Button>
        </div>
      </div>
    </div>
  )
}