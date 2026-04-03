import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-12 lg:px-8 max-w-5xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Master Workflow Automation.
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              The complete curriculum to design, build, and deploy sophisticated logic pipelines. No fluff, just pure engineering.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/course" className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              Start Learning
            </Link>
            <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-6 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
              Create Account
            </Link>
          </div>

          {/* Hero Image */}
          <div className="w-full mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/hero.png"
              alt="Naim Academy Workflow Illustration"
              className="w-full h-auto"
            />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
