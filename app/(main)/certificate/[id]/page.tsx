"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Award, Printer, ChevronLeft, ShieldCheck, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
          const found = (json.user.certifications || []).find((c: any) => c.certificationId === certId)
          if (found) {
            setCert(found)
          } else {
            router.push("/certificates")
          }
        }
      } catch (err) {
        console.error("Failed to fetch certificate", err)
        router.push("/certificates")
      } finally {
        setLoading(false)
      }
    }
    if (certId) fetchCert()
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
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-6 print:static">
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
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" />
          Print Certificate
        </Button>
      </div>

      {/* Certificate Frame */}
      <div className="relative group overflow-hidden">
        {/* Certificate preview */}
        <div
          id="certificate-content"
          className="relative border-8 border-double border-slate-200 rounded-xl bg-white px-12 py-16 flex flex-col items-center gap-8 text-center shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 size-16 border-t-2 border-l-2 border-slate-300 opacity-50" />
          <div className="absolute top-4 right-4 size-16 border-t-2 border-r-2 border-slate-300 opacity-50" />
          <div className="absolute bottom-4 left-4 size-16 border-b-2 border-l-2 border-slate-300 opacity-50" />
          <div className="absolute bottom-4 right-4 size-16 border-b-2 border-r-2 border-slate-300 opacity-50" />

          {/* Top Seal */}
          <div className="relative">
            <div className="size-20 rounded-full border-4 border-slate-100 flex items-center justify-center bg-slate-50 shadow-inner">
               <Award className="size-10 text-slate-800" />
            </div>
            <div className="absolute -bottom-2 -left-2 size-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center opacity-80">
               <ShieldCheck className="size-4 text-slate-600" />
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-4 font-sans">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 border-b-2 border-slate-100 pb-4">
              CERTIFICATE <span className="font-light text-slate-500">of</span> COMPLETION
            </h2>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-[0.25em]">
              NAIM ACADEMY EXPERTISE CREDENTIAL
            </p>
          </div>

          {/* Achievement Body */}
          <div className="space-y-6 pt-4 font-sans">
            <p className="text-base text-slate-500 font-medium">This prestigious certificate is awarded to</p>
            <div className="space-y-1">
              <p className="text-4xl font-black text-slate-900 drop-shadow-sm">{cert.studentName}</p>
              <div className="h-0.5 bg-slate-900 w-full mb-1" />
            </div>
            <p className="text-base text-slate-500 font-medium pt-2">for demonstrating exceptional knowledge and passing the</p>
            <p className="text-2xl font-bold text-slate-900">{cert.courseTitle}</p>
            <p className="text-sm font-medium text-slate-600 italic">Advanced Examination: {cert.examTitle}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-12 w-full pt-10 px-6 font-sans">
            <div className="text-left space-y-2 border-t-2 border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date of Award</p>
              <p className="text-sm font-black text-slate-800">{formatDate(cert.issuedAt)}</p>
            </div>
            <div className="text-right space-y-2 border-t-2 border-slate-100 pt-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Final Examination Score</p>
              <p className="text-sm font-black text-slate-800">{cert.score}%</p>
            </div>
          </div>

          {/* Signature & Barcode Area */}
          <div className="w-full flex items-end justify-between pt-12 font-sans">
             <div className="text-left space-y-2">
                <div className="h-10 w-32 border-b border-slate-300 flex items-end">
                   <span className="italic text-xl text-slate-400 pl-1 opacity-60">Naim Academy</span>
                </div>
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-tighter">Academic Director</p>
             </div>

             {/* Barcode representation */}
             <div className="text-right flex flex-col items-end gap-1">
                <div className="flex gap-[1px] h-10 items-end opacity-80">
                   {[...Array(24)].map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-slate-900" 
                        style={{ 
                          width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px`,
                          height: `${40 + (Math.sin(i) * 5)}px`
                        }} 
                      />
                   ))}
                </div>
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest select-all">
                  {cert.certificationId}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
