"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/footer";
import { ArrowLeft, Copy, Check, Heart, Wallet, CreditCard } from "lucide-react";

export default function DonatePage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#f8fafc" }}>
      <main className="flex-1 flex flex-col items-center px-4 lg:px-8 max-w-md mx-auto py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#C41E3A] transition-colors mb-4">
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div className="w-full space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#C41E3A] to-[#a01830] rounded-xl p-6 text-white">
            <div className="flex items-center justify-center mb-2">
              <Heart className="size-8 fill-white" />
            </div>
            <h1 className="text-xl font-bold text-center">Buy Me a Coffee</h1>
            <p className="text-center text-white/80 text-sm mt-2">
              Support Naim Academy
            </p>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Bank Details</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Account Holder</span>
                <span className="text-sm font-semibold text-gray-800">Yahia Naim</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 items-center">
                <span className="text-xs text-gray-500">RIB</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-800">007090000355600016002100</span>
                  <CopyButton text="007090000355600016002100" />
                </div>
              </div>
              <div className="flex justify-between py-2 items-center">
                <span className="text-xs text-gray-500">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-800">0355600016002100</span>
                  <CopyButton text="0355600016002100" />
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-[#C41E3A]/5 border border-[#C41E3A]/10 rounded-xl p-4">
            <p className="text-sm text-gray-600 text-center">
              Thank you for your support ❤️
            </p>
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
    <button onClick={handleCopy} className="p-1 hover:bg-gray-100 rounded" title="Copy">
      {copied ? <Check className="size-3.5 text-[#C41E3A]" /> : <Copy className="size-3.5 text-gray-400" />}
    </button>
  );
}