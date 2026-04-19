"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/course" },
  { name: "Community", href: "/community" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const courses = [
  { title: "Workflow Automation", subtitle: "n8n Mastery", desc: "Build automation systems that save hours" },
  { title: "AI for Projects", subtitle: "Practical AI", desc: "Create real AI-powered applications" },
  { title: "Prompt Engineering", subtitle: "Master Communication", desc: "Get better AI results" },
  { title: "English for Tech", subtitle: "Global Skills", desc: "Professional English for developers" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF5] border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight uppercase" style={{ fontFamily: "system-ui" }}>
            Naim Academy
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="font-bold text-black hover:underline underline-offset-4">
                {link.name}
              </Link>
            ))}
            <Link href="/course" className="px-6 py-3 bg-[#FFD23F] border-4 border-black font-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
              START LEARNING
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 border-4 border-black">
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t-4 border-black p-4 bg-[#FFFDF5]">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="block py-3 font-bold border-b-2 border-gray-200"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-4 border-black p-8 md:p-12 bg-white shadow-[8px_8px_0_0_#000]">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-6">
              MASTER AI<br/>
              & AUTOMATION<br/>
              <span className="text-[#FF6B6B]">BUILD SKILLS</span><br/>
              THAT PAY
            </h1>
            <p className="text-lg md:text-xl font-bold mb-8 max-w-xl">
              Not theory. Real working projects. Skills that generate income. 
              Learn by building, not watching.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/course" className="px-8 py-4 bg-[#74B9FF] border-4 border-black font-black text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
                EXPLORE COURSES
              </Link>
              <Link href="/community" className="px-8 py-4 bg-[#88D498] border-4 border-black font-black text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
                JOIN COMMUNITY
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Services Section */}
      <section className="py-20 px-6 bg-[#FFD23F] border-y-4 border-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12">WHAT WE DO</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <div key={index} className="p-8 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all shadow-[6px_6px_0_0_#000]">
                <div className="text-xs font-black text-gray-400 mb-2">0{index + 1}</div>
                <h3 className="text-2xl font-black mb-1">{course.title}</h3>
                <p className="text-sm font-bold text-gray-500 mb-4">{course.subtitle}</p>
                <p className="font-medium">{course.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-8">WHO BUILT THIS</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-black mb-4">Yahia Naim</h3>
              <p className="text-lg font-bold mb-6">
                After seeing thousands stuck in endless courses without real skills, 
                I created Naim Academy to focus on what actually matters: 
                building working systems that generate income.
              </p>
              <p className="font-medium">
                Our approach: learn by building, not watching. No fluff—just practical skills 
                you can use immediately to create real value.
              </p>
            </div>
            <div className="h-64 md:h-80 bg-[#FFA552] border-4 border-black flex items-center justify-center">
              <span className="font-black text-2xl">[FOUNDER IMAGE]</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#B8A9FA] border-y-4 border-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            READY TO BUILD?
          </h2>
          <p className="text-xl font-bold mb-8">
            Join thousands learning practical tech skills.
          </p>
          <Link href="/course" className="inline-block px-10 py-5 bg-[#FFD23F] border-4 border-black font-black text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
            START LEARNING →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#FFFDF5] border-t-4 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl font-black uppercase">Naim Academy</div>
          <div className="flex items-center gap-6 font-bold">
            <Link href="/privacy" className="hover:underline">PRIVACY</Link>
            <Link href="/terms" className="hover:underline">TERMS</Link>
            <Link href="/contact" className="hover:underline">CONTACT</Link>
          </div>
          <div className="flex gap-2">
            <span className="font-bold text-sm">SHARE:</span>
            <button className="px-3 py-1 bg-[#74B9FF] border-2 border-black font-bold text-sm hover:bg-[#FF6B6B]">
              ×
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}