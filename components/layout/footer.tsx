import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {year} Naim Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/transparency" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
