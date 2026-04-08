import { ImageResponse } from "@vercel/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get("title") || "Article"
  const excerpt = searchParams.get("excerpt") || "Read this article on Naim Academy"
  const author = searchParams.get("author") || "Naim Academy"
  const imageUrl = searchParams.get("image") || ""

  let coverImage = null
  if (imageUrl) {
    try {
      const response = await fetch(imageUrl)
      if (response.ok) {
        const imageData = await response.arrayBuffer()
        const base64 = Buffer.from(imageData).toString("base64")
        const mimeType = response.headers.get("content-type") || "image/jpeg"
        coverImage = `data:${mimeType};base64,${base64}`
      }
    } catch (e) {
      console.log("Failed to fetch image")
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1f2937",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background Image */}
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                top: -100,
                right: -100,
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                opacity: 0.3,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -150,
                left: -150,
                width: 500,
                height: 500,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                opacity: 0.2,
              }}
            />
          </>
        )}

        {/* Dark Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: coverImage 
              ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)"
              : "rgba(0,0,0,0.1)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            height: "100%",
            padding: 60,
          }}
        >
          {/* Author badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {author.charAt(0)}
            </div>
            <span
              style={{
                fontSize: 20,
                color: "#ffffff",
                opacity: 0.9,
              }}
            >
              {author}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 50 ? 38 : 48,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: 20,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          <div
            style={{
              fontSize: 20,
              color: "#ffffff",
              opacity: 0.8,
              maxWidth: 800,
              lineHeight: 1.5,
              marginBottom: 36,
            }}
          >
            {excerpt.length > 120 ? excerpt.substring(0, 120) + "..." : excerpt}
          </div>

          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1f2937",
                }}
              >
                Naim Academy
              </span>
            </div>
            <span
              style={{
                fontSize: 16,
                color: "#ffffff",
                opacity: 0.6,
              }}
            >
              naimacademy.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    }
  )
}
