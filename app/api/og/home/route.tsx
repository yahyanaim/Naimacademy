import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          backgroundColor: "#FFFDF5",
          fontSize: 60,
          fontWeight: "bold",
          border: "12px solid #000",
        }}
      >
        <div style={{ color: "#000", marginBottom: 20 }}>NAIM ACADEMY</div>
        <div style={{ color: "#FF6B6B", fontSize: 80 }}>MASTER AI & AUTOMATION</div>
        <div style={{ color: "#666", fontSize: 30, marginTop: 40, fontWeight: "normal" }}>
          Not theory. Real working projects.
        </div>
        <div style={{ color: "#666", fontSize: 30, fontWeight: "normal" }}>
          Skills that generate income.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}