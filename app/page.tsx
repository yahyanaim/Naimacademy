import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6 -mt-14">
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Master Workflow Automation.
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            The complete curriculum to design, build, and deploy sophisticated logic pipelines. No fluff, just pure engineering.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <Link href="/course" className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Start Learning
          </Link>
          <Link href="/signup" className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            Create Account
          </Link>
        </div>

        <div className="w-full max-w-3xl mx-auto flex-1 flex items-end justify-center pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/hero.png"
            alt="Naim Academy Workflow Illustration"
            className="w-full h-auto max-h-[40vh] object-contain"
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
