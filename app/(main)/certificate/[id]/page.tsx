"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Award, ChevronLeft, ShieldCheck } from "lucide-react"
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
  const certId = params?.id as string
  
  const [cert, setCert] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(true)

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
      {/* Page header */}
      <div className="flex items-center justify-between">
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

          {/* Title Area */}
          <div className="title-section">
            <h2 className="title-text">
              CERTIFICATE <span className="title-of">of</span> COMPLETION
            </h2>
            <p className="subtitle-text">
              NAIM ACADEMY EXPERTISE CREDENTIAL
            </p>
          </div>

          {/* Achievement Body */}
          <div className="body-section">
            <p className="award-label">This prestigious certificate is awarded to</p>
            <div className="recipient-section">
              <p className="recipient-name">{cert.studentName}</p>
              <div className="name-line" />
            </div>
            <p className="course-label">for demonstrating exceptional knowledge and passing the</p>
            <p className="course-name">{cert.courseTitle}</p>
            <p className="exam-name">Advanced Examination: {cert.examTitle}</p>
          </div>

          {/* Metadata Grid */}
          <div className="metadata-grid">
            <div className="metadata-item metadata-left">
              <p className="metadata-label">Date of Award</p>
              <p className="metadata-value">{formatDate(cert.issuedAt)}</p>
            </div>
            <div className="metadata-item metadata-right">
              <p className="metadata-label">Final Examination Score</p>
              <p className="metadata-value">{cert.score}%</p>
            </div>
          </div>

          {/* Signature & Barcode Area */}
          <div className="footer-section">
             <div className="signature-block">
                <div className="signature-line-area">
                   <span className="signature-text">Naim Academy</span>
                </div>
                <p className="signature-label">Academic Director</p>
             </div>

             {/* Barcode representation */}
             <div className="barcode-block">
                <div className="barcode-bars">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="barcode-bar" 
                        style={{ 
                          width: `${(i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 1.5)}px`,
                          height: `${30 + (Math.sin(i) * 4)}px`
                        }} 
                      />
                   ))}
                </div>
                <p className="barcode-id">
                  {cert.certificationId}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}