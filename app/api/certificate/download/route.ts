import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { withAuth } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(
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

      const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Certificate - ${cert.studentName}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  @media print { .page-break { page-break-before: always; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; background: #fff; color: #1a1a2e; }
  .cert-page { width: 1122px; height: 793px; padding: 30px 50px; position: relative; background: #fff; }
  .cert-border { border: 10px solid #1a1a2e; height: 100%; position: relative; }
  .cert-border-inner { border: 2px solid #c9a84c; height: 100%; padding: 30px 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .corner { position: absolute; width: 40px; height: 40px; border-color: #c9a84c; }
  .corner-tl { top: 15px; left: 15px; border-top: 3px solid; border-left: 3px solid; }
  .corner-tr { top: 15px; right: 15px; border-top: 3px solid; border-right: 3px solid; }
  .corner-bl { bottom: 15px; left: 15px; border-bottom: 3px solid; border-left: 3px solid; }
  .corner-br { bottom: 15px; right: 15px; border-bottom: 3px solid; border-right: 3px solid; }
  .seal { width: 70px; height: 70px; border-radius: 50%; background: #1a1a2e; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
  .seal-inner { width: 50px; height: 50px; border-radius: 50%; background: #c9a84c; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #1a1a2e; }
  .cert-title { font-size: 32px; font-weight: bold; letter-spacing: 3px; margin-bottom: 2px; }
  .cert-title-of { font-size: 20px; font-style: italic; color: #c9a84c; }
  .cert-subtitle { font-size: 12px; color: #888; letter-spacing: 2px; margin-bottom: 25px; }
  .cert-label { font-size: 13px; color: #999; margin-bottom: 6px; }
  .cert-name { font-size: 28px; font-weight: bold; border-bottom: 2px solid #c9a84c; padding-bottom: 4px; margin-bottom: 18px; min-width: 350px; text-align: center; }
  .cert-course { font-size: 16px; font-weight: bold; margin-bottom: 3px; }
  .cert-exam { font-size: 13px; color: #666; margin-bottom: 25px; }
  .cert-meta { display: flex; justify-content: space-between; width: 100%; padding: 0 50px; font-size: 12px; color: #666; margin-bottom: 20px; }
  .cert-footer { display: flex; justify-content: space-between; width: 100%; padding: 0 50px; }
  .sig-block { text-align: center; }
  .sig-line { width: 180px; border-bottom: 1px solid #333; margin-bottom: 4px; padding-top: 20px; }
  .sig-name { font-size: 11px; font-weight: bold; }
  .sig-title { font-size: 9px; color: #888; }
  .barcode { font-family: monospace; font-size: 9px; color: #888; text-align: right; }
  .barcode-id { font-weight: bold; color: #333; margin-top: 2px; }
  .letter-page { width: 794px; min-height: 1123px; padding: 60px 70px; background: #fff; }
  .letter-header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #c9a84c; }
  .letter-academy { font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #1a1a2e; }
  .letter-tagline { font-size: 11px; color: #888; letter-spacing: 2px; margin-top: 4px; }
  .letter-date { font-size: 13px; color: #666; margin-bottom: 30px; }
  .letter-greeting { font-size: 15px; margin-bottom: 20px; }
  .letter-paragraph { font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 16px; text-align: justify; }
  .letter-closing { font-size: 14px; margin-top: 30px; margin-bottom: 40px; }
  .letter-sig-block { margin-top: 40px; }
  .letter-sig-name { font-size: 18px; font-weight: bold; font-style: italic; margin-bottom: 2px; }
  .letter-sig-full { font-size: 13px; font-weight: bold; }
  .letter-sig-title { font-size: 11px; color: #888; }
</style>
</head>
<body>
<div class="cert-page">
  <div class="cert-border">
    <div class="cert-border-inner">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      <div class="seal"><div class="seal-inner">&#9733;</div></div>
      <div class="cert-title">CERTIFICATE <span class="cert-title-of">of</span> COMPLETION</div>
      <div class="cert-subtitle">NAIM ACADEMY EXPERTISE CREDENTIAL</div>
      <div class="cert-label">This prestigious certificate is awarded to</div>
      <div class="cert-name">${cert.studentName}</div>
      <div class="cert-label">for demonstrating exceptional knowledge and passing the</div>
      <div class="cert-course">${cert.courseTitle}</div>
      <div class="cert-exam">Advanced Examination: ${cert.examTitle}</div>
      <div class="cert-meta">
        <div>Date of Award: ${issuedDate}</div>
        <div>Final Examination Score: ${cert.score}%</div>
      </div>
      <div class="cert-footer">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">Yahia Naim</div>
          <div class="sig-title">Founder &amp; Academic Director</div>
        </div>
        <div class="barcode"><div class="barcode-id">${cert.certificationId}</div></div>
      </div>
    </div>
  </div>
</div>
<div class="page-break"></div>
<div class="letter-page">
  <div class="letter-header">
    <div class="letter-academy">NAIM ACADEMY</div>
    <div class="letter-tagline">Excellence in Education</div>
  </div>
  <div class="letter-date">${issuedDate}</div>
  <div class="letter-greeting">Dear <strong>${cert.studentName}</strong>,</div>
  <p class="letter-paragraph">Congratulations on your outstanding achievement in completing <strong>${cert.courseTitle}</strong>. Your dedication, perseverance, and commitment to excellence are truly commendable. Earning this certification is a testament to your hard work and the passion you bring to your professional growth.</p>
  <p class="letter-paragraph">At Naim Academy, we believe that learning is a lifelong journey — one that opens doors, sparks innovation, and transforms careers. This milestone is not an endpoint, but a stepping stone toward even greater accomplishments. We encourage you to keep pushing boundaries, exploring new horizons, and never losing that hunger for knowledge.</p>
  <p class="letter-paragraph">The skills you have mastered will serve you well in the challenges ahead. Stay curious. Stay ambitious. And remember that every expert was once a beginner who refused to give up.</p>
  <p class="letter-paragraph">We are honored to have been part of your journey and look forward to supporting your continued success. Keep reaching for excellence — the best is yet to come.</p>
  <div class="letter-closing">With warm regards and highest esteem,</div>
  <div class="letter-sig-block">
    <div class="letter-sig-name">Yahia Naim</div>
    <div class="letter-sig-full">Yahia Naim</div>
    <div class="letter-sig-title">Founder &amp; Academic Director, Naim Academy</div>
  </div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    } catch (error) {
      console.error("[GET /api/certificate/download]", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
