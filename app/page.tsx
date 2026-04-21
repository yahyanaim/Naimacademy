"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

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
  { title: "English Tech & Soft Skills", subtitle: "Career & Communication", desc: "Professional English + communication skills" },
];

const educationLevels = ["High School", "University Student", "Bachelor", "Master", "PhD", "Other"];
const interests = ["Workflow Automation", "AI Engineering", "Prompt Engineering", "English Tech & Soft Skills", "All of them"];

export default function HomePage() {
  const [form, setForm] = useState({ name: "", email: "", education: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.education && form.interest) {
      setLoading(true);
      try {
        const res = await fetch(`${window.location.origin}/api/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            education: form.education,
            interest: form.interest,
            motivation: "",
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSubmitted(true);
        } else {
          alert(data.error || "Something went wrong");
        }
      } catch (error) {
        console.error("Failed to submit:", error);
        alert("Failed to submit");
      } finally {
        setLoading(false);
      }
    }
  };

return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Join learners on Discord
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Master AI & <span className="text-primary">Automation</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Not theory. Real working projects. Skills that generate income. 
            Learn by building, not watching.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <a href="https://discord.gg/3xm8JZ8g" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
              Join Discord
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="#waitlist" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-400 rounded-md font-medium hover:border-slate-600 transition-colors">
              Join Waitlist
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-sm font-medium">Share:</span>
            <div className="flex items-center gap-2">
            <a href="https://facebook.com" target="_blank" rel="noopener" className="p-1.5 rounded-full bg-black hover:bg-[#1877F2] transition-all" aria-label="Facebook">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5L14.17.5C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" className="p-1.5 rounded-full bg-black hover:bg-black transition-all" aria-label="Twitter">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" className="p-1.5 rounded-full bg-black hover:bg-gradient-to-r hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] transition-all" aria-label="Instagram">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2.16c3.2,0,3.58,0,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s0,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58,0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.18,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33,0,7.05.07c-4.27.2-6.78,2.71-7,7C0,8.33,0,8.74,0,12s0,3.67.07,4.95c.2,4.27,2.71,6.78,7,7C8.33,24,8.74,24,12,24s3.67,0,4.95-.07c4.27-.2,6.78-2.71,7-7C24,15.67,24,15.26,24,12s0-3.67-.07-4.95c-.2-4.27-2.71-6.78-7-7C15.67,0,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z"/></svg>
            </a>
            <a href="mailto:hello@naimacademy.com" className="p-1.5 rounded-full bg-black hover:bg-red-500 transition-all" aria-label="Email">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
          </div>
        </div>
        </div>
      </main>

      {/* Courses Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Courses We Offer</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Practical skills that actually matter in today's job market
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <div key={index} className="p-6 rounded-lg border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-sm text-muted-foreground mb-2 group-hover:text-primary transition-colors">0{index + 1}</div>
                <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{course.subtitle}</p>
                <p className="text-sm text-muted-foreground">{course.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="border border-slate-300 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-2">Join the Waitlist</h2>
            <p className="text-muted-foreground text-center mb-6">Be the first to know when we launch</p>
          
          {submitted ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-md text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-green-800">Thanks! You're on the list.</p>
              <p className="text-green-600 text-sm mt-1">We'll contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Education Level</label>
                <select 
                  value={form.education}
                  onChange={(e) => setForm({...form, education: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  required
                >
                  <option value="">Select your education level</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">What do you want to learn?</label>
                <select 
                  value={form.interest}
                  onChange={(e) => setForm({...form, interest: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  required
                >
                  <option value="">Select your interest</option>
                  {interests.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Submitting..." : "Join Waitlist"}
              </button>
            </form>
          )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands learning practical tech skills
          </p>
          <Link href="/course" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}