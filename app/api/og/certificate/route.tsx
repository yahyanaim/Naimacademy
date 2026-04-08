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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fefdfb",
          backgroundImage: "linear-gradient(to bottom, #fefdfb, #f8f7f4)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "3px solid #1f2937",
            borderRadius: 8,
          }}
        />

        {/* Inner decorative border */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            right: 30,
            bottom: 30,
            border: "1px solid #d1d5db",
            borderRadius: 4,
          }}
        />

        {/* Award badge */}
        <div
          style={{
            position: "absolute",
            top: 60,
            backgroundColor: "#1f2937",
            borderRadius: "50%",
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #fef08a",
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fef08a"
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
            marginTop: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 300,
              letterSpacing: 12,
              color: "#1f2937",
            }}
          >
            CERTIFICATE
          </div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: 8,
              color: "#6b7280",
              marginTop: 8,
            }}
          >
            OF COMPLETION
          </div>
        </div>

        {/* Awarded to */}
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: "#6b7280",
          }}
        >
          This certificate is awarded to
        </div>

        {/* Name */}
        <div
          style={{
            marginTop: 16,
            fontSize: 52,
            fontWeight: 700,
            color: "#1f2937",
            fontStyle: "italic",
          }}
        >
          {name}
        </div>

        {/* Underline */}
        <div
          style={{
            width: 400,
            height: 2,
            backgroundColor: "#1f2937",
            marginTop: 8,
          }}
        />

        {/* Course */}
        <div
          style={{
            marginTop: 32,
            fontSize: 18,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          for successfully completing
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            fontWeight: 600,
            color: "#1f2937",
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          {course}
        </div>

        {/* Score and Date */}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            gap: 80,
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
                fontSize: 14,
                color: "#9ca3af",
                marginBottom: 4,
              }}
            >
              Score
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {score}%
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#9ca3af",
                marginBottom: 4,
              }}
            >
              Date
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              {date}
            </div>
          </div>
        </div>

        {/* Certificate ID */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            fontSize: 12,
            color: "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          Certificate ID: {certId}
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            right: 50,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1f2937",
            }}
          >
            NAIM ACADEMY
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
