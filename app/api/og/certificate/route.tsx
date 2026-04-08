import { ImageResponse } from "@vercel/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const certId = searchParams.get("id") || "unknown"
  const name = searchParams.get("name") || "Student"
  const course = searchParams.get("course") || "Naim Academy Course"
  const score = searchParams.get("score") || "0"
  const date = searchParams.get("date") || new Date().toLocaleDateString()

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
            top: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "60px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
              boxShadow: "0 0 60px rgba(251, 191, 36, 0.5)",
            }}
          >
            <svg
              width="45"
              height="45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "8px",
              color: "#fbbf24",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Certificate of Completion
          </div>

          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "40px",
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontSize: "18px",
              color: "#94a3b8",
              marginBottom: "16px",
            }}
          >
            has successfully completed
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#ffffff",
              textAlign: "center",
              maxWidth: "800px",
              marginBottom: "40px",
            }}
          >
            {course}
          </div>

          {/* Score and Date */}
          <div
            style={{
              display: "flex",
              gap: "60px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Score
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: "#fbbf24",
                }}
              >
                {score}%
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "60px",
                backgroundColor: "#334155",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Date
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                {date}
              </div>
            </div>
          </div>

          {/* Branding */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                backgroundColor: "#fbbf24",
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                }}
              >
                NAIM ACADEMY
              </span>
            </div>
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
