import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen pt-14 overflow-hidden" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 pb-16">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy & Transparency</h1>
            <p className="text-muted-foreground">Version 2.0 - Last updated: April 7, 2026</p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and email address</li>
                <li>Profile photo (optional, stored via Cloudinary)</li>
                <li>Course progress and lesson completion data</li>
                <li>Exam results and certificates</li>
                <li>Video playback timestamps</li>
                <li>Learning schedule preferences</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and improve our learning platform</li>
                <li>Track your course progress and generate certificates</li>
                <li>Send account-related emails (verification, password reset)</li>
                <li>Communicate important updates about your courses</li>
                <li>Authenticate your account and secure your data</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Email Communication</h2>
              <p>We send emails for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Email Verification:</strong> To verify your email address during registration</li>
                <li><strong>Password Reset:</strong> To allow you to reset your password securely</li>
                <li><strong>Notifications:</strong> Important updates about your courses and account</li>
              </ul>
              <p>We use Mailjet for transactional emails. We do not send marketing or promotional emails.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Profile Photos</h2>
              <p>You may optionally upload a profile photo. Photos are:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Stored securely on Cloudinary (a cloud image management service)</li>
                <li>Resized and cropped to 200x200 pixels for optimization</li>
                <li>Only visible to you and platform administrators</li>
                <li>Deleted when you delete your account</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Transparency</h2>
              <p>We believe in full transparency with our users:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Data Storage:</strong> Your data is stored securely in MongoDB Atlas, a cloud-based database service.</li>
                <li><strong>Image Storage:</strong> Profile photos are stored on Cloudinary.</li>
                <li><strong>Email Service:</strong> Transactional emails are sent via Mailjet.</li>
                <li><strong>Security:</strong> We use industry-standard encryption (bcrypt) to protect your password.</li>
                <li><strong>Payments:</strong> We do NOT store payment information. All bank transfers are made directly between you and our bank account.</li>
                <li><strong>Third Parties:</strong> We do not sell, trade, or share your personal information with third parties.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Bank Transfer Details</h2>
              <p>For bank transfers, we use CIH Bank:</p>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Account Number:</strong> 3505240211002500</p>
                <p><strong>I.B.A.N:</strong> MA64 2305 9035 0524 0211 0025 0072</p>
                <p><strong>B.I.C / SWIFT:</strong> CIHMMAMC</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Update or correct your information</li>
                <li>Delete your account and all associated data</li>
                <li>Export your progress and certificates</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Account Deletion</h2>
              <p>You can delete your account at any time from your profile settings. This action is permanent and will remove:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All your personal information</li>
                <li>Your profile photo from Cloudinary</li>
                <li>Your course progress and exam results</li>
                <li>All certificates earned</li>
              </ul>
              <p>This cannot be undone.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
              <p>We use a single authentication cookie to keep you logged in. This cookie expires after 7 days of inactivity. We do not use tracking or advertising cookies.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
              <p>If you have questions about this policy, please contact us through the platform or email us at yahyaniam2001@gmail.com.</p>
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