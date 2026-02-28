"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MapPin, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden">
      {/* Navigation */}
      <nav className="w-full glass-card rounded-none border-x-0 border-t-0 px-6 py-4 fixed top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center glow-green">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-wide">ThoongaNagar AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#about" className="text-sm font-medium hover:text-primary-green transition-colors">
            About
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary-blue transition-colors">
                Dashboard
              </Link>
              <button onClick={logout} className="glass-button px-4 py-2 text-sm font-medium text-white hover:bg-risk-red/20 hover:border-risk-red/50 hover:text-risk-red transition-all">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-primary-blue transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="glass-button px-4 py-2 text-sm font-medium text-white">
                Report Waste
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-32 pb-20 mt-16 flex flex-col items-center text-center relative">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-green/10 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-primary-blue/10 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 mt-4 leading-tight">
            Predict Waste. <br />
            Prevent Recurrence. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-green via-white to-primary-blue drop-shadow-lg">
              Power Clean Madurai.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            AI That Never Sleeps for a Cleaner Madurai. Shifting urban governance from reactive cleaning to preventive intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary-green hover:bg-primary-green/90 text-black font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 group glow-green"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="bg-primary-green hover:bg-primary-green/90 text-black font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 group glow-green"
              >
                Start Reporting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              href="#about"
              className="glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Mock Before/After Image Area */}
        <motion.div
          className="mt-24 w-full glass-card h-[400px] md:h-[500px] flex overflow-hidden group relative hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-shadow duration-500"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute inset-x-0 top-0 flex justify-between p-4 z-10 pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-lg">Before: Recurring Hotspot</span>
            <span className="bg-primary-green/20 text-primary-green border border-primary-green/30 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-lg">After: AI Preventive Action</span>
          </div>

          <div className="w-1/2 h-full bg-cover bg-center border-r-[3px] border-white relative transition-all duration-300" style={{ backgroundImage: "url('/madurai-dirty.png')" }}>
            <div className="absolute inset-0 bg-risk-red/30 mix-blend-color-burn"></div>
          </div>
          <div className="w-1/2 h-full bg-cover bg-center transition-all duration-300" style={{ backgroundImage: "url('/madurai-clean.png')" }}>
            <div className="absolute inset-0 bg-primary-green/20 mix-blend-overlay"></div>
          </div>

          {/* Slider Thumb Mock */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center text-black z-20 shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-ew-resize hover:scale-110 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="w-full bg-black/40 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-blue/5 backdrop-blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-blue/20 flex flex-col items-center justify-center mx-auto mb-6 glow-blue">
            <Info className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">About ThoongaNagaram AI</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-4xl mx-auto">
            ThoongaNagaram AI is a revolutionary AI-powered platform designed to
            protect Madurai&apos;s heritage while ensuring a sustainable future. By shifting away from reactive dumping tracking,
            ThoongaNagaram AI utilizes a <span className="text-primary-green font-semibold">citizen-centric reporting mechanism</span> integrated with
            advanced deep learning. It predicts potential waste hotspots, categorizes waste types (e.g., Commercial Packing,
            Market Waste, Illegal Dumping), and prescribes actionable interventions before waste even accumulates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left mt-12 bg-black/30 p-8 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary-green mb-3">
                <ShieldCheck className="w-5 h-5" /> Preventive Intelligence
              </h3>
              <p className="text-gray-400">
                Rather than simply mapping where waste is dumped, our Gemini-powered engine decodes the root cause behind
                recurring waste violations to prevent them.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary-blue mb-3">
                <MapPin className="w-5 h-5" /> Community Collaboration
              </h3>
              <p className="text-gray-400">
                Residents are empowered with a seamless mobile web dashboard to capture images of unmanaged waste, securely tracked
                via GPS to instantly deploy municipal action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-black/30 py-24 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our AI engine diagnoses root causes, predicts risk, and recommends interventions to eliminate hotspots forever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MapPin />, color: "text-primary-blue", bg: "bg-primary-blue/20", glow: "glow-blue", title: "1. Capture", desc: "Citizen uploads a photo. GPS and metadata are auto-detected." },
              { icon: <AlertTriangle />, color: "text-warning-amber", bg: "bg-warning-amber/20", glow: "shadow-[0_0_15px_rgba(255,179,0,0.5)]", title: "2. Analyze", desc: "Gemini Vision identifies waste type and analyzes the structural root cause." },
              { icon: <BarChart3 />, color: "text-risk-red", bg: "bg-risk-red/20", glow: "glow-red", title: "3. Predict", desc: "Recurrence engine calculates risk level based on POIs and historical data." },
              { icon: <ShieldCheck />, color: "text-primary-green", bg: "bg-primary-green/20", glow: "glow-green", title: "4. Prevent", desc: "Command center recommends structural or behavioral interventions." }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="glass-card p-6 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`w-14 h-14 rounded-full ${step.bg} flex justify-center items-center mb-6 ${step.glow}`}>
                  <div className={step.color}>{step.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="w-full max-w-6xl mx-auto py-24 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-12 text-gray-300 tracking-wider uppercase">Current Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { metric: "12,450+", label: "Reports Analyzed", color: "text-primary-blue" },
            { metric: "85%", label: "Root Cause Accuracy", color: "text-primary-green" },
            { metric: "-32%", label: "Reduction in Recurrence", color: "text-warning-amber" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="glass-card p-8 flex flex-col justify-center border-white/5"
            >
              <h4 className={`text-5xl font-black mb-2 ${stat.color}`}>{stat.metric}</h4>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-8 mt-10 text-center text-gray-500 text-sm">
        <p>© 2026 ThoongaNagaram AI</p>
      </footer>
    </main>
  );
}
