"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/footer";
import { Coffee, ArrowLeft, Copy, Check, Wallet, CreditCard, Building2, ShieldCheck } from "lucide-react";

export default function DonatePage() {
  return (
    <div className="flex flex-col min-h-screen pt-14" style={{ backgroundColor: "#f8fafc" }}>
      <main className="flex-1 flex flex-col items-center px-4 lg:px-8 max-w-xl mx-auto py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div className="w-full">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Coffee className="size-6" />
              </div>
              <h1 className="text-2xl font-bold">Support Our Mission</h1>
            </div>
            <p className="text-center text-emerald-100 text-sm leading-relaxed">
              Your contribution helps us keep the platform free and add more courses for everyone.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="size-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-800">Bank Transfer Details</span>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Wallet className="size-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Account Holder</p>
                  <p className="text-sm font-semibold text-gray-800">Yahia Naim</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="size-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">RIB</p>
                  <p className="text-sm font-mono font-semibold text-gray-800">007090000355600016002100</p>
                </div>
                <CopyButton text="007090000355600016002100" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="size-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Account Number</p>
                  <p className="text-sm font-mono font-semibold text-gray-800">0355600016002100</p>
                </div>
                <CopyButton text="0355600016002100" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Your support matters</p>
              <p className="text-xs text-emerald-600 mt-1">
                Every contribution goes directly to improving the platform and adding new courses.
              </p>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Thank you for being part of Naim Academy ❤️
          </p>
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
      className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-gray-400" />}
    </button>
  );
}