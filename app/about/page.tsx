import Link from "next/link";
import Footer from "@/components/layout/footer";

export const metadata = {
  title: "About Us - Naim Academy",
  description: "Learn about Naim Academy, our mission to provide free n8n, AI, and data science education, and how we operate through voluntary donations.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#fefdfb", overflowX: "hidden" }}>
      <main className="flex-1 pb-16">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
            <p className="text-muted-foreground text-lg">Empowering learners through free n8n, AI, and data science education</p>
          </div>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p>
              Welcome to Naim Academy, a free online learning platform dedicated to making n8n workflow 
              automation, AI, and data science education accessible to everyone. We believe that 
              technical skills should be available to all, regardless of their location, 
              financial situation, or circumstances.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Our Mission</h2>
            <p>
              Our mission is simple: to provide free, high-quality education in n8n automation, 
              artificial intelligence, and data science to anyone with an internet connection. 
              We are committed to breaking down the barriers that often prevent people from 
              learning these valuable skills.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">How We Operate</h2>
            <p>
              Naim Academy is completely free for all students. We do not charge any fees for accessing 
              our courses, watching lessons, or taking exams. Our platform is built and maintained through 
              the generous support of our community via donations.
            </p>
            <p>
              If you find value in our content and would like to support our mission, you can make a 
              voluntary donation. These contributions help us cover hosting costs, improve our platform, 
              and continue developing new courses. However, donations are entirely optional and do not 
              affect access to any content.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">What We Offer</h2>
            <p>
              Our platform provides structured courses designed to help you build a strong foundation 
              in n8n, AI, and data science. Each course includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comprehensive lessons covering essential topics</li>
              <li>Progress tracking to monitor your learning journey</li>
              <li>Exams to test your understanding</li>
              <li>Certificates upon successful completion</li>
              <li>Article discussions where you can share your thoughts and vote on content</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Our Values</h2>
            <p>
              <strong>Accessibility:</strong> We believe education should have no barriers. Our platform 
              is designed to be user-friendly and accessible to all, regardless of their technical expertise.
            </p>
            <p>
              <strong>Integrity:</strong> We are committed to transparency in our operations and ensuring 
              the accuracy of our educational content.
            </p>
            <p>
              <strong>Community:</strong> We foster a supportive learning community where students can 
              engage, discuss, and grow together through our article comments and feedback system.
            </p>
            <p>
              <strong>Continuous Improvement:</strong> We constantly strive to improve our platform and 
              content based on student feedback and needs.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Getting Started</h2>
            <p>
              To access our courses, simply create a free account. Once your account is verified, you 
              can start learning immediately. If you choose to support us, you can make a bank transfer 
              donation, but this is entirely optional and all course content remains free.
            </p>
            <p>
              Start your learning journey today and discover the world of n8n automation, AI, and data science 
              in a supportive, free environment.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Get in Touch</h2>
            <p>
              We would love to hear from you! Whether you have questions about our courses, feedback 
              to share, or just want to say hello, feel free to reach out at{' '}
              <a href="mailto:yahyaniam2001@gmail.com" className="text-primary hover:underline">
                yahyaniam2001@gmail.com
              </a>.
            </p>
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
