import Link from "next/link";
import Footer from "@/components/layout/footer";

export const metadata = {
  title: "About Us - Naim Academy",
  description: "Learn about Naim Academy, our mission, values, and the team behind our online learning platform dedicated to providing quality Islamic education.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 pb-16">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About Naim Academy</h1>
            <p className="text-muted-foreground text-lg">Empowering learners through quality Islamic education</p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
              <p className="text-lg">
                Naim Academy is dedicated to making quality Islamic education accessible to everyone. 
                We believe that knowledge of the Quran and Islamic teachings should be available to all, 
                regardless of their location or circumstances.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">What We Offer</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Structured Courses</h3>
                  <p className="text-sm">Comprehensive courses designed with progressive learning paths to help you build a strong foundation in Islamic knowledge.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Expert-Led Content</h3>
                  <p className="text-sm">All our content is carefully prepared and reviewed to ensure accuracy and educational value.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Track Your Progress</h3>
                  <p className="text-sm">Monitor your learning journey with progress tracking, exams, and certificates upon completion.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Community Engagement</h3>
                  <p className="text-sm">Learn alongside others through our article comments and voting system that helps identify quality content.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Our Values</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Accessibility</h3>
                    <p className="text-sm">We believe education should have no barriers. Our platform is designed to be user-friendly and accessible to all.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Integrity</h3>
                    <p className="text-sm">We are committed to transparency in our operations and the integrity of our educational content.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Community</h3>
                    <p className="text-sm">We foster a supportive learning community where students can engage, discuss, and grow together.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Continuous Improvement</h3>
                    <p className="text-sm">We constantly strive to improve our platform and content based on student feedback.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Create an Account</h3>
                    <p className="text-sm">Sign up for free to access our courses. Course access is granted after payment confirmation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">2</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Complete Payment</h3>
                    <p className="text-sm">Make a bank transfer to unlock your selected courses. Contact us for custom packages.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">3</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Start Learning</h3>
                    <p className="text-sm">Access lessons, track your progress, take exams, and earn certificates as you complete courses.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Get in Touch</h2>
              <p>
                We would love to hear from you! Whether you have questions about our courses, 
                feedback to share, or just want to say hello, feel free to reach out.
              </p>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <p className="text-sm">
                  <strong>Email:</strong> yahyaniam2001@gmail.com
                </p>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-2xl font-semibold text-foreground">Learn More</h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/privacy" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/transparency" className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  Transparency Report
                </Link>
                <Link href="/terms" className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  Terms of Service
                </Link>
              </div>
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
