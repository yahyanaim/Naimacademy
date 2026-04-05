import Link from "next/link";
import Footer from "@/components/layout/footer";
import { Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const shareUrl = "https://naimacademy.vercel.app";
const shareText = "Welcome to Naim Academy! Start learning workflow automation with n8n today.";

export default function HomePage() {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent("Naim Academy - Learn Workflow Automation")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="space-y-5 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Master Workflow Automation.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto">
            The complete curriculum to design, build, and deploy sophisticated logic pipelines. No fluff, just pure engineering.
          </p>
          <p className="text-lg font-medium text-primary">
            Welcome to Naim Academy - Start your automation journey today!
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/course" className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Start Learning
          </Link>
          <Link href="/signup" className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            Create Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Share2 className="size-4" />
            Share:
          </span>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black hover:bg-gray-800 text-white">
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white">
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href={shareLinks.email} className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white">
            <Mail className="size-4" />
          </a>
        </div>

        <div className="w-full max-w-2xl mx-auto mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/hero.png"
            alt="Naim Academy Workflow Illustration"
            className="w-full h-auto"
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
