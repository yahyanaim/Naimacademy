import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen pt-14 overflow-hidden" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 pb-16">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Version 2.0 - Last updated: April 7, 2026</p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>By creating an account and using Naim Academy, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
              <p>Naim Academy provides an online learning platform for n8n automation courses. Our services include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Video lessons and course materials</li>
                <li>Interactive quizzes and exams</li>
                <li>AI-powered chatbot assistance</li>
                <li>Progress tracking and certificates</li>
                <li>Learning schedule management</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Account Requirements</h2>
              <p>To create an account, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be at least 13 years old</li>
                <li>Provide a valid email address</li>
                <li>Accept our Terms of Service and Privacy Policy</li>
                <li>Have a valid invite code (if required)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. User Responsibilities</h2>
              <p>As a user of Naim Academy, you agree to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Keep your account credentials secure</li>
                <li>Not share your account with others</li>
                <li>Not attempt to cheat on exams or quizzes</li>
                <li>Not use the platform for any illegal purposes</li>
                <li>Not interfere with the proper functioning of the platform</li>
                <li>Respect other users and maintain appropriate conduct</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
              <p>All course content, including videos, lessons, and materials, are the property of Naim Academy. You may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Redistribute or share course content</li>
                <li>Use content for commercial purposes</li>
                <li>Attempt to download or copy course materials without permission</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Certificates</h2>
              <p>Upon passing the certification exam, you may receive a certificate of completion. Certificates:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Are issued in your registered name</li>
                <li>Cannot be transferred or sold</li>
                <li>May be revoked if cheating is detected</li>
                <li>Represent completion of the n8n Automation course</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Account Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate these Terms of Service</li>
                <li>Engage in cheating or fraudulent activity</li>
                <li>Harass or harm other users</li>
                <li>Attempt to access systems without authorization</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Disclaimer of Warranties</h2>
              <p>Naim Academy is provided "as is" without warranties of any kind. We do not guarantee:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Uninterrupted or error-free service</li>
                <li>That course content will meet your specific needs</li>
                <li>Specific results from using the platform</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Limitation of Liability</h2>
              <p>We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
              <p>If you have questions about these Terms of Service, please contact us at yahyaniam2001@gmail.com.</p>
            </section>
          </div>

          <div className="pt-6 border-t border-border">
            <Link href="/" className="text-primary hover:underline text-sm">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
