import { ImageResponse } from "@vercel/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get("title") || "Article"
  const excerpt = searchParams.get("excerpt") || "Read this article on Naim Academy"
  const author = searchParams.get("author") || "Naim Academy"
  const coverImage = searchParams.get("image")

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />
        )}
        
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)",
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
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#ffffff",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {author.charAt(0)}
              </span>
              <span
                style={{
                  fontSize: 18,
                  color: "#ffffff",
                  opacity: 0.9,
                }}
              >
                {author}
              </span>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 60 ? 48 : 56,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: 20,
              maxWidth: 900,
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
              maxWidth: 700,
              lineHeight: 1.4,
              marginBottom: 30,
            }}
          >
            {excerpt}
          </div>

          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
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
                opacity: 0.7,
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
    }
  )
}
