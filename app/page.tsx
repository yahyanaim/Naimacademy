import Link from "next/link";
import Footer from "@/components/layout/footer";
import { Share2, Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const shareUrl = "https://naimacademy.vercel.app";
const shareText = "Welcome to Naim Academy! Start learning workflow automation with n8n today.";

const services = [
  {
    title: "Workflow Automation with n8n",
    description: "Master no-code automation to save hours of manual work and create freelance income.",
    icon: "⚡",
  },
  {
    title: "AI for Real Projects",
    description: "Build AI-powered applications that actually generate value and income.",
    icon: "🤖",
  },
  {
    title: "Prompt Engineering",
    description: "Learn to communicate with AI effectively and get better results.",
    icon: "💬",
  },
  {
    title: "English for Tech",
    description: "Professional English for developers and global communication.",
    icon: "🌍",
  },
];

export default function HomePage() {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent("Naim Academy - Learn Workflow Automation")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Dark */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:px-8 max-w-6xl mx-auto text-center" style={{ backgroundColor: "#0f0f0f" }}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight" style={{ fontFamily: "system-ui" }}>
            Master Workflow Automation.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Build Skills That Pay.
            </span>
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed text-gray-400 max-w-2xl mx-auto">
            The complete curriculum to design, build, and deploy sophisticated logic pipelines. 
            No fluff, just pure engineering. Learn by building, not watching.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link href="/course" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-sm font-medium text-white transition-all hover:scale-105">
            Start Learning <ArrowRight className="size-4" />
          </Link>
          <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-gray-700 px-8 text-sm font-medium text-white transition-all hover:bg-gray-800">
            Create Account
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-4xl mx-auto mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/hero.png"
            alt="Naim Academy Workflow Illustration"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>
      </main>

      {/* Services Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#0f0f0f" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            What We Do
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Practical skills that generate income. Not courses—working systems.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-all group"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="py-20 px-6" style={{ backgroundColor: "#fafafa" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Naim Academy?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Build Real Projects (not just watch videos)",
              "Learn industry tools used in companies",
              "AI + Automation + Productivity stack",
              "Community of builders & founders",
              "Career & freelancing opportunities",
              "Practical focus - learn by doing"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm">
                <div className="size-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="size-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#0f0f0f" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of learners mastering workflow automation, AI, and practical tech skills.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/course" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white text-black px-8 text-sm font-bold transition-all hover:scale-105">
              Explore Courses <ArrowRight className="size-4" />
            </Link>
            <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-gray-700 px-8 text-sm font-medium text-white transition-all hover:bg-gray-800">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-12 px-6" style={{ backgroundColor: "#fafafa" }}>
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
            <Share2 className="size-4" />
            Share with your network:
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black hover:bg-[#1877F2] text-white hover:text-white transition-colors">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black hover:bg-black text-white hover:text-white transition-colors">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black hover:bg-[#0A66C2] text-white hover:text-white transition-colors">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href={shareLinks.email} className="p-3 rounded-full bg-black hover:bg-red-600 text-white hover:text-white transition-colors">
              <Mail className="size-5" />
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}