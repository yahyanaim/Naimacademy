"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/footer";
import { ArrowLeft, Copy, Check, Wallet, CreditCard, Building2, ShieldCheck, Heart } from "lucide-react";

export default function DonatePage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col h-screen pt-14 overflow-hidden" style={{ backgroundColor: "#f5f5f5" }}>
      <main className="flex-1 flex flex-col items-center px-4 lg:px-8 max-w-md mx-auto py-8 overflow-y-auto">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#C41E3A] transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="w-full">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-[#C41E3A] to-[#a01830] rounded-2xl p-6 text-white mb-5 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="size-8 fill-white" />
            </div>
            <h1 className="text-xl font-bold text-center">Buy Me a Coffee</h1>
            <p className="text-center text-white/80 text-sm mt-2 leading-relaxed">
              Support Naim Academy and help us keep the platform free for everyone.
            </p>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Building2 className="size-4 text-[#C41E3A]" />
              <span className="text-sm font-semibold text-gray-700">Bank Transfer</span>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-9 h-9 bg-[#C41E3A]/10 rounded-lg flex items-center justify-center">
                  <Wallet className="size-4 text-[#C41E3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Account Holder</p>
                  <p className="text-sm font-bold text-gray-800">Yahia Naim</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-9 h-9 bg-[#C41E3A]/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="size-4 text-[#C41E3A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">RIB</p>
                  <p className="text-xs font-mono font-bold text-gray-800 break-all">MA64 2305 9035 0524 0211 0025 0072</p>
                </div>
                <CopyButton text="MA64 2305 9035 0524 0211 0025 0072" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-9 h-9 bg-[#C41E3A]/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="size-4 text-[#C41E3A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Account Number</p>
                  <p className="text-sm font-mono font-bold text-gray-800">3505240211002500</p>
                </div>
                <CopyButton text="3505240211002500" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-9 h-9 bg-[#C41E3A]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="size-4 text-[#C41E3A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">B.I.C / SWIFT</p>
                  <p className="text-sm font-mono font-bold text-gray-800">CIHMMAMC</p>
                </div>
                <CopyButton text="CIHMMAMC" />
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-[#C41E3A]/5 border border-[#C41E3A]/10 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-[#C41E3A]/10 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4 text-[#C41E3A]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Secure Transfer</p>
              <p className="text-xs text-gray-600 mt-1">
                Use your banking app or website to transfer securely. Keep your transaction receipt.
              </p>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Thank you for your support ❤️
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
      {copied ? <Check className="size-4 text-[#C41E3A]" /> : <Copy className="size-4 text-gray-400" />}
    </button>
  );
}