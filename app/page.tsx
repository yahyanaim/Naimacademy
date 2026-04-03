import Link from "next/link";
import { Button } from "@/components/ui/button";
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
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/course">Start Learning</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 px-6">
              <Link href="/signup">Create Account</Link>
            </Button>
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
