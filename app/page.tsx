"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Courses", href: "/course" },
  { name: "Articles", href: "/blog" },
  { name: "Community", href: "/community" },
  { name: "Join Waitlist", href: "#waitlist" },
];

const courses = [
  { title: "Workflow Automation", subtitle: "n8n Mastery", desc: "Build automation systems that save hours" },
  { title: "AI Engineering", subtitle: "Practical AI Skills", desc: "Build real AI-powered applications that generate value" },
  { title: "Prompt Engineering", subtitle: "Master Communication", desc: "Get better AI results from AI tools" },
  { title: "English Tech & Soft Skills", subtitle: "Career & Communication", desc: "Professional English + communication, productivity & entrepreneurship" },
];

const educationLevels = ["High School", "University Student", "Bachelor", "Master", "PhD", "Other"];
const interests = ["Workflow Automation", "AI Engineering", "Prompt Engineering", "English Tech & Soft Skills", "All of them"];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", education: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.education && form.interest) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF5] border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight uppercase">
            Naim Academy
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              link.href.startsWith("#") ? (
                <a key={link.name} href={link.href} className="px-4 py-2 bg-[#FFD23F] border-3 border-black font-bold hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-[3px_3px_0_0_#000]">
                  {link.name}
                </a>
              ) : (
                <Link key={link.name} href={link.href} className="font-bold text-black hover:underline underline-offset-4">
                  {link.name}
                </Link>
              )
            ))}
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
            <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-6">
              MASTER<br/>
              AI & <span className="text-[#FF6B6B]">AUTOMATION</span>
            </h1>
            <p className="text-lg md:text-xl font-bold mb-8">
              Not theory. Real working projects.<br/>
              Skills that generate income.<br/>
              Learn by building, not watching.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://discord.com" target="_blank" rel="noopener" className="px-8 py-4 bg-[#74B9FF] border-4 border-black font-black text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
                JOIN DISCORD
              </a>
              <Link href="#waitlist" className="px-8 py-4 bg-[#FFD23F] border-4 border-black font-black text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
                JOIN WAITLIST
              </Link>
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Services Section */}
      <section className="py-20 px-6 bg-[#FFD23F] border-y-4 border-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12">COURSES WE OFFER</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <div key={index} className="p-6 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all shadow-[6px_6px_0_0_#000]">
                <div className="text-xs font-black text-gray-400 mb-2">0{index + 1}</div>
                <h3 className="text-xl font-black mb-1">{course.title}</h3>
                <p className="text-sm font-bold text-gray-500 mb-2">{course.subtitle}</p>
                <p className="font-medium text-sm">{course.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Form Section */}
      <section id="waitlist" className="py-20 px-6 bg-white border-b-4 border-black">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-center">JOIN THE WAITLIST</h2>
          <p className="text-lg font-bold mb-8 text-center">Be the first to know when we launch.</p>
          
          {submitted ? (
            <div className="p-8 bg-[#88D498] border-4 border-black text-center">
              <p className="text-2xl font-black">THANKS! YOU'RE ON THE LIST.</p>
              <p className="font-bold mt-2">We'll contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">FULL NAME *</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full p-4 border-4 border-black font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-2">EMAIL *</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full p-4 border-4 border-black font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-2">EDUCATION LEVEL *</label>
                <select 
                  value={form.education}
                  onChange={(e) => setForm({...form, education: e.target.value})}
                  className="w-full p-4 border-4 border-black font-bold bg-white"
                  required
                >
                  <option value="">Select your education level</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">WHAT DO YOU WANT TO LEARN? *</label>
                <select 
                  value={form.interest}
                  onChange={(e) => setForm({...form, interest: e.target.value})}
                  className="w-full p-4 border-4 border-black font-bold bg-white"
                  required
                >
                  <option value="">Select your interest</option>
                  {interests.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-[#FF6B6B] border-4 border-black font-black text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
                JOIN WAITLIST
              </button>
            </form>
          )}
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
          <Link href="/course" className="inline-block px-10 py-5 bg-[#88D498] border-4 border-black font-black text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0_0_#000]">
            START LEARNING →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#FFFDF5] border-t-4 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-black uppercase">Naim Academy</div>
            <div className="flex flex-wrap gap-4 text-sm font-bold">
              <Link href="/about" className="hover:underline">ABOUT US</Link>
              <Link href="/privacy" className="hover:underline">PRIVACY</Link>
              <Link href="/terms" className="hover:underline">TERMS</Link>
            </div>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener" className="px-4 py-2 bg-[#74B9FF] border-2 border-black font-bold text-sm hover:bg-blue-500 hover:text-white">
                FACEBOOK
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener" className="px-4 py-2 bg-black border-2 border-black font-bold text-sm text-white hover:bg-gray-700">
                TWITTER
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener" className="px-4 py-2 bg-[#FF6B6B] border-2 border-black font-bold text-sm hover:bg-pink-600 hover:text-white">
                INSTAGRAM
              </a>
              <a href="mailto:hello@naimacademy.com" className="px-4 py-2 bg-[#FFD23F] border-2 border-black font-bold text-sm hover:bg-yellow-500">
                EMAIL
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}