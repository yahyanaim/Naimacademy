"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { 
  Sparkles, 
  Workflow, 
  MessageSquare, 
  GraduationCap, 
  Globe, 
  ArrowRight, 
  Check,
  Users,
  Building,
  Code,
  Briefcase,
  Zap,
  Clock,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const tracks = [
  {
    icon: Sparkles,
    title: "AI for Real Use Cases",
    description: "Practical AI skills that actually generate value",
    outcomes: ["Build AI-powered apps", "Automate workflows with AI", "Create income opportunities"],
    color: "bg-gradient-to-br from-purple-500 to-pink-500"
  },
  {
    icon: Workflow,
    title: "n8n Automation",
    description: "No-code workflow automation for businesses",
    outcomes: ["Build automation systems", "Save hours of manual work", "Create freelance income"],
    color: "bg-gradient-to-br from-blue-500 to-cyan-500"
  },
  {
    icon: MessageSquare,
    title: "Prompt Engineering",
    description: "Master the art of communicating with AI",
    outcomes: ["Get better AI results", "Automate content creation", "Boost productivity 10x"],
    color: "bg-gradient-to-br from-green-500 to-emerald-500"
  },
  {
    icon: Globe,
    title: "English for Tech",
    description: "Professional English for developers & innovators",
    outcomes: ["Global communication", "Technical writing", "Career advancement"],
    color: "bg-gradient-to-br from-orange-500 to-amber-500"
  }
];

const benefits = [
  { icon: Code, title: "Build Real Projects", description: "Not courses. Actual working systems." },
  { icon: Zap, title: "Industry Tools", description: "Learn what companies actually use" },
  { icon: Users, title: "Community of Builders", description: "Network with founders & freelancers" },
  { icon: Briefcase, title: "Career Ready", description: "Skills that generate income" },
  { icon: Star, title: "Practical Focus", description: "Learn by building, not watching" },
  { icon: Building, title: "Startup Mindset", description: "Think like a founder" }
];

const roles = ["Student", "Developer", "Freelancer", "Founder", "Employee", "Other"];
const interests = ["AI", "n8n Automation", "Prompt Engineering", "Soft Skills", "English for Tech", "All of them"];

export default function HomePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    role: "",
    interest: "",
    motivation: "",
    agreed: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role || !form.interest || !form.motivation) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!form.agreed) {
      toast.error("Please agree to receive updates");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        toast.success("Application submitted! We'll review and send your invitation code when selected.");
        setForm({ name: "", email: "", country: "", role: "", interest: "", motivation: "", agreed: false });
      } else {
        const data = await res.json();
        toast.error(data.error || "Something went wrong");
      }
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)" }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[128px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-8">
            <Clock className="size-4" />
            <span>Limited Early Access • Selection-Based</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Learn AI, Automation & Prompt Engineering Like a{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Real Builder
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Not theory. Real projects. Real systems. Build skills that generate income & opportunities.
          </p>
          
          <p className="text-gray-500 mb-10">
            The platform for Practical AI • Workflow Automation • Prompt Engineering • Career Skills
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#apply" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
              Apply for Early Access
              <ArrowRight className="size-4" />
            </a>
            <a href="#waitlist" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/20 px-8 text-sm font-medium text-white transition-all hover:bg-white/10">
              Join the Waitlist
            </a>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            🎯 127 spots remaining • Review applications weekly
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6" style={{ backgroundColor: "#fafafa" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Problem with Traditional Learning</h2>
          
          <div className="grid gap-4">
            {[
              "Too much theory, no real skills that generate income",
              "Confusion between AI, automation, and prompts",
              "No structured roadmap from beginner to builder",
              "Courses that teach but don't create income",
              "No community of builders & collaborators"
            ].map((problem, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border shadow-sm">
                <div className="size-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  ×
                </div>
                <span className="text-gray-700">{problem}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-xl font-semibold mt-8 text-gray-900">
            That's why we built Naim Academy.
          </p>
        </div>
      </section>

      {/* Solution Section - 4 Tracks */}
      <section className="py-24 px-6" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What You Get</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            4 learning tracks designed for real-world application. Build skills, not just knowledge.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((track, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl ${track.color} text-white mb-4`}>
                    <track.icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{track.title}</h3>
                  <p className="text-gray-600 mb-4">{track.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">You'll build:</p>
                    {track.outcomes.map((outcome, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="size-4 text-green-500" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" style={{ backgroundColor: "#fafafa" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-16">Simple 3 steps to join the movement</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Apply Now", description: "Fill out your application with your background & interests" },
              { step: "02", title: "Get Reviewed", description: "Our team reviews applications weekly for fit" },
              { step: "03", title: "Get Invited", description: "Receive your invitation code when accepted" }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-sm text-gray-500">
            🔒 Selective admission • Quality over quantity • Limited spots
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-24 px-6" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Join Naim Academy</h2>
          <p className="text-gray-600 text-center mb-16">More than just courses. A transformation.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="size-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6" style={{ backgroundColor: "#fafafa" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Early Builders Say</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="text-left">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-4">"I've taken many courses, but Naim Academy is different. They actually teach you how to build stuff that makes money."</p>
                <p className="font-semibold">— Ahmed K., Developer</p>
              </CardContent>
            </Card>
            <Card className="text-left">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-4">"The n8n automation track helped me automate my freelance workflow. I've saved 10+ hours weekly."</p>
                <p className="font-semibold">— Sarah M., Freelancer</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Apply Now - MOST IMPORTANT */}
      <section id="apply" className="py-24 px-6" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Apply for Early Access</h2>
            <p className="text-gray-400">Join our first cohort. Limited spots available.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                <Input 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Your full name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email *</label>
                <Input 
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Country</label>
                <Input 
                  value={form.country}
                  onChange={(e) => setForm({...form, country: e.target.value})}
                  placeholder="e.g., Egypt, UAE, KSA"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Current Role *</label>
                <select 
                  value={form.role}
                  onChange={(e) => setForm({...form, role: e.target.value})}
                  className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                >
                  <option value="" className="text-black">Select role</option>
                  {roles.map(r => <option key={r} value={r} className="text-black">{r}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Skills Interest *</label>
              <select 
                value={form.interest}
                onChange={(e) => setForm({...form, interest: e.target.value})}
                className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              >
                <option value="" className="text-black">What do you want to learn?</option>
                {interests.map(i => <option key={i} value={i} className="text-black">{i}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Why do you want to join? *</label>
              <Textarea 
                value={form.motivation}
                onChange={(e) => setForm({...form, motivation: e.target.value})}
                placeholder="Tell us about your goals and motivation..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
                required
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="agree" 
                checked={form.agreed}
                onCheckedChange={(checked) => setForm({...form, agreed: checked as boolean})}
                className="border-white/20"
              />
              <label htmlFor="agree" className="text-sm text-gray-400 cursor-pointer">
                I agree to receive invitation updates and platform announcements
              </label>
            </div>
            
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full"
            >
              {submitting ? "Submitting..." : "Request Early Access"}
            </Button>
            
            <p className="text-center text-xs text-gray-500">
              🎯 We review applications weekly • Invitation codes sent to selected applicants
            </p>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section id="waitlist" className="py-24 px-6" style={{ backgroundColor: "#fafafa" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Limited Early Access Cohort</h2>
          <p className="text-gray-600 mb-8">
            This isn't a typical launch. We're building aexclusive community of builders. 
            Selection-based. Limited spots. When the invitation system closes, it closes.
          </p>
          
          <a href="#apply" className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-sm font-medium text-white transition-all hover:scale-105">
            Apply Now
            <ArrowRight className="size-4" />
          </a>
          
          <p className="text-sm text-gray-500 mt-8">
            Questions? Contact us at hello@naimacademy.com
          </p>
        </div>
      </section>

      {/* Footer
      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 Naim Academy. Built for builders.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
}