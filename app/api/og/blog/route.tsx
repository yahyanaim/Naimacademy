import { ImageResponse } from "@vercel/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get("title") || "Article"
  const excerpt = searchParams.get("excerpt") || "Read this article on Naim Academy"
  const author = searchParams.get("author") || "Naim Academy"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f172a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "80px",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                }}
              >
                NAIM ACADEMY
              </span>
            </div>
          </div>

          {/* Author */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "#8b5cf6",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "700",
                color: "#ffffff",
              }}
            >
              {author.charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                fontSize: "20px",
                color: "#94a3b8",
              }}
            >
              {author}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 40 ? "44px" : "56px",
              fontWeight: "700",
              color: "#ffffff",
              lineHeight: 1.15,
              marginBottom: "24px",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          <div
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              maxWidth: "800px",
              lineHeight: 1.5,
              marginBottom: "40px",
            }}
          >
            {excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt}
          </div>

          {/* Website */}
          <div
            style={{
              fontSize: "18px",
              color: "#64748b",
            }}
          >
            naimacademy.com
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
