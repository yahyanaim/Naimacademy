import { Metadata } from "next"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://naimacademy.com"
  
  return {
    title: "My Certificate - Naim Academy",
    description: "I earned my certificate from Naim Academy! Check out my achievement.",
    openGraph: {
      title: "I just earned my certificate from Naim Academy!",
      description: "I completed the n8n Automation course and earned my certificate. Join me on this learning journey!",
      type: "website",
      images: [
        {
          url: `${baseUrl}/api/og/certificate?id=${id}&name=Student&course=Naim+Academy+Course&score=100&date=${encodeURIComponent(new Date().toLocaleDateString())}`,
          width: 1200,
          height: 630,
          alt: "Naim Academy Certificate",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "I just earned my certificate from Naim Academy!",
      description: "I completed the n8n Automation course and earned my certificate.",
      images: [`${baseUrl}/api/og/certificate?id=${id}`],
    },
  }
}

export default async function CertificateLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  return children
}
