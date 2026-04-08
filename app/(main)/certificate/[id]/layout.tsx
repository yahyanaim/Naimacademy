import { Metadata } from "next"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_BASE_URL 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : "https://naimacademy.com"
  
  const ogImageUrl = `${baseUrl}/api/og/certificate?id=${id}`
  
  return {
    title: "My Certificate - Naim Academy",
    description: "I earned my certificate from Naim Academy! Check out my achievement.",
    openGraph: {
      title: "I just earned my certificate from Naim Academy!",
      description: "I completed a course and earned my certificate. Join me on this learning journey!",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Naim Academy Certificate",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "I just earned my certificate from Naim Academy!",
      description: "I completed a course and earned my certificate.",
      images: [ogImageUrl],
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
