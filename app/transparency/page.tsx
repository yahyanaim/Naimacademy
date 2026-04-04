import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function TransparencyPage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 pb-16">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Transparency Report</h1>
            <p className="text-muted-foreground">Last updated: April 4, 2026</p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Our Commitment</h2>
              <p>Naim Academy is committed to operating with full transparency. This report outlines how we handle your data, our platform practices, and our organizational values.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Data Practices</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="font-medium text-foreground text-sm">What we collect</p>
                  <p className="text-sm mt-1">Name, email, course progress, exam scores, video timestamps</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="font-medium text-foreground text-sm">What we don&apos;t collect</p>
                  <p className="text-sm mt-1">Browsing history, device fingerprints, location data, third-party tracking identifiers</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="font-medium text-foreground text-sm">What we don&apos;t sell</p>
                  <p className="text-sm mt-1">We never sell, trade, or share your personal data with any third party</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Security Measures</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Passwords are hashed using bcrypt with 12 rounds</li>
                <li>Authentication tokens are HTTP-only cookies</li>
                <li>All connections use HTTPS encryption</li>
                <li>Database access is restricted to authorized administrators only</li>
                <li>Input sanitization prevents injection attacks</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Technology Stack</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Frontend:</strong> Next.js 15, React 19, Tailwind CSS</li>
                <li><strong>Backend:</strong> Next.js API Routes, MongoDB</li>
                <li><strong>Hosting:</strong> Vercel (global edge network)</li>
                <li><strong>Database:</strong> MongoDB Atlas (encrypted at rest)</li>
                <li><strong>Authentication:</strong> Custom JWT-based sessions</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Content Access</h2>
              <p>Course sections are locked by default and can only be unlocked by administrators. This ensures a structured learning experience. Students cannot bypass locked content.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Data Retention</h2>
              <p>Your data is retained for as long as your account is active. If you delete your account, all associated data is permanently removed from our systems within 30 days.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Changes to This Report</h2>
              <p>We will update this report whenever our practices change. The &quot;Last updated&quot; date at the top will reflect the most recent revision.</p>
            </section>
          </div>

          <div className="pt-6 border-t border-border flex items-center gap-6">
            <Link href="/" className="text-primary hover:underline text-sm">
              &larr; Back to Home
            </Link>
            <Link href="/privacy" className="text-primary hover:underline text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
