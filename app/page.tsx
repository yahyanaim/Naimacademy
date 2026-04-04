import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function HomePage() {
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
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/course" className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Start Learning
          </Link>
          <Link href="/signup" className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            Create Account
          </Link>
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
