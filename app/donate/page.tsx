"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/footer";
import { Coffee, ArrowLeft, Building, Copy, Check } from "lucide-react";

export default function DonatePage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#fefdfb" }}>
      <main className="flex-1 pb-16">
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <Coffee className="size-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Buy Me a Coffee</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your support helps make the platform scalable so we can add more courses and keep improving the learning experience for everyone.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building className="size-5" />
              CIH Bank Transfer
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Holder</p>
                  <p className="text-sm font-medium mt-0.5">Yahia Naim</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">RIB</p>
                  <p className="text-sm font-mono font-medium mt-0.5">007090000355600016002100</p>
                </div>
                <CopyButton text="007090000355600016002100" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Number</p>
                  <p className="text-sm font-mono font-medium mt-0.5">0355600016002100</p>
                </div>
                <CopyButton text="0355600016002100" />
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Purpose:</strong> To make the platform scalable to other courses
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for your support! Every contribution counts. ☕</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-md hover:bg-muted transition-colors"
      title="Copy"
    >
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4 text-muted-foreground" />}
    </button>
  );
}
