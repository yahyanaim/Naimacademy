import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const cert = user.certifications?.[0];
      if (!cert) {
        return NextResponse.json(
          { error: "No certificate found" },
          { status: 404 }
        );
      }

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; background: #fff; }
  .cert { width: 1122px; height: 793px; padding: 40px 60px; position: relative; border: 12px solid #1a1a2e; }
  .cert-inner { border: 2px solid #c9a84c; height: 100%; padding: 30px 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .title { font-size: 36px; font-weight: bold; color: #1a1a2e; letter-spacing: 4px; margin-bottom: 4px; }
  .title-of { font-size: 22px; font-style: italic; color: #c9a84c; }
  .subtitle { font-size: 14px; color: #666; letter-spacing: 2px; margin-bottom: 30px; }
  .label { font-size: 14px; color: #888; margin-bottom: 8px; }
  .name { font-size: 32px; color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 4px; margin-bottom: 20px; min-width: 400px; text-align: center; }
  .course { font-size: 18px; color: #1a1a2e; font-weight: bold; margin-bottom: 4px; }
  .exam { font-size: 14px; color: #666; margin-bottom: 30px; }
  .meta { display: flex; justify-content: space-between; width: 100%; padding: 0 40px; font-size: 13px; color: #666; }
  .footer { display: flex; justify-content: space-between; width: 100%; padding: 0 40px; margin-top: 30px; }
  .sig { text-align: center; }
  .sig-line { width: 200px; border-bottom: 1px solid #333; margin-bottom: 4px; }
  .sig-name { font-size: 12px; font-weight: bold; }
  .sig-title { font-size: 10px; color: #888; }
  .barcode { font-family: monospace; font-size: 10px; color: #888; }
</style>
</head>
<body>
<div class="cert">
  <div class="cert-inner">
    <div class="title">CERTIFICATE <span class="title-of">of</span> COMPLETION</div>
    <div class="subtitle">NAIM ACADEMY EXPERTISE CREDENTIAL</div>
    <div class="label">This prestigious certificate is awarded to</div>
    <div class="name">${cert.studentName}</div>
    <div class="label">for demonstrating exceptional knowledge and passing the</div>
    <div class="course">${cert.courseTitle}</div>
    <div class="exam">Advanced Examination: ${cert.examTitle}</div>
    <div class="meta">
      <div>Date of Award: ${new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
      <div>Final Examination Score: ${cert.score}%</div>
    </div>
    <div class="footer">
      <div class="sig">
        <div class="sig-line"></div>
        <div class="sig-name">Yahia Naim</div>
        <div class="sig-title">Founder & Academic Director</div>
      </div>
      <div class="barcode">${cert.certificationId}</div>
    </div>
  </div>
</div>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="certificate-${cert.certificationId}.html"`,
        },
      });
    } catch (error) {
      console.error("[POST /api/certificate/download]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
