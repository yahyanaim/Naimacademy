"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight, CheckCircle } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
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
      {/* Hero Section */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Join 2,000+ learners on Discord
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Master AI & <span className="text-primary">Automation</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Not theory. Real working projects. Skills that generate income. 
            Learn by building, not watching.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://discord.gg/3xm8JZ8g" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
              Join Discord
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="#waitlist" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary rounded-md font-medium hover:bg-primary/10 transition-colors">
              Join Waitlist
            </Link>
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
          <a href="https://discord.gg/3xm8JZ8g" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}