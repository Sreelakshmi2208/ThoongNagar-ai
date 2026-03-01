"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MapPin, AlertTriangle, ShieldCheck, Info, Camera, Sparkles, Heart, Zap, Waves, Hospital } from "lucide-react";
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
          <span className="font-bold text-xl tracking-wide">ThoongaNagaram AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#vision" className="text-sm font-medium hover:text-primary-green transition-colors">
            Vision
          </Link>
          <Link href="#features" className="text-sm font-medium hover:text-primary-blue transition-colors">
            Features
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
              <Link href="/auth/register" className="glass-button px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-green/20">
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
          <p className="text-primary-green font-bold tracking-widest uppercase text-xs mb-4">Clean Madurai. Prevent Waste. Protect Health.</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            AI That Never Sleeps<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-green via-white to-primary-blue drop-shadow-lg">
              for a Cleaner Madurai
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            ThoongaNagaram AI is an intelligent urban governance platform that transforms waste management from reactive cleaning into preventive, data-driven action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? "/report" : "/auth/register"}
              className="bg-primary-green hover:bg-primary-green/90 text-black font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 group glow-green"
            >
              Report Waste
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#vision"
              className="glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2"
            >
              Explore How It Works
            </Link>
          </div>
        </motion.div>

        {/* Before/After Section - STRICTLY PRESERVING IMAGES AND LABELS */}
        <motion.div
          className="mt-24 w-full glass-card h-[400px] md:h-[500px] flex overflow-hidden group relative hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-shadow duration-500"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute inset-x-0 top-0 flex justify-between p-4 z-10 pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-xs font-bold tracking-wide shadow-lg">Before: Recurring Hotspot</span>
            <span className="bg-primary-green/20 text-primary-green border border-primary-green/30 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold tracking-wide shadow-lg">After: AI Preventive Action</span>
          </div>

          <div className="w-1/2 h-full bg-cover bg-center border-r-[3px] border-white relative transition-all duration-300" style={{ backgroundImage: "url('/madurai-dirty.png')" }}>
            <div className="absolute inset-0 bg-risk-red/30 mix-blend-color-burn" />
          </div>
          <div className="w-1/2 h-full bg-cover bg-center transition-all duration-300" style={{ backgroundImage: "url('/madurai-clean.png')" }}>
            <div className="absolute inset-0 bg-primary-green/20 mix-blend-overlay" />
          </div>

          {/* Slider Thumb */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center text-black z-20 shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-ew-resize hover:scale-110 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.div>
      </section>

      {/* Vision Statement Section */}
      <section id="vision" className="w-full bg-black/40 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-blue/5 backdrop-blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-blue/20 flex flex-col items-center justify-center mx-auto mb-6 glow-blue">
            <Info className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Our Vision</h2>
          <p className="text-2xl text-white font-medium leading-relaxed max-w-4xl mx-auto italic">
            "Madurai is a city of heritage, culture, and life. ThoongaNagaram AI safeguards this legacy by combining artificial intelligence, citizen participation, and municipal coordination to stop waste accumulation before it begins."
          </p>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="w-full bg-background-dark py-24 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Core Intelligence Modules</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Comprehensive urban solutions powered by deep-learning and citizen action.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Camera className="text-primary-green" />,
                title: "1. Citizen Waste Reporting & Complaints",
                desc: "Citizens can report unmanaged waste, illegal dumping, or sanitation issues by uploading photos. Each report is automatically tagged with location data and analyzed by AI to trigger faster municipal action and long-term prevention."
              },
              {
                icon: <Sparkles className="text-primary-blue" />,
                title: "2. AI-Powered Preventive Intelligence",
                desc: "Advanced vision models identify waste types, assess risk levels, and predict recurrence using historical patterns and location intelligence, enabling authorities to intervene before hotspots return."
              },
              {
                icon: <Hospital className="text-warning-amber" />,
                title: "3. Hospital Biomedical Waste Monitoring – Safe Trace",
                desc: "Hospitals are monitored using a secure QR-based Safe Trace system to ensure biomedical waste is disposed of within mandated timelines, reducing public health risks and improving accountability."
              },
              {
                icon: <Waves className="text-risk-red" />,
                title: "4. Vaigai River Protection",
                desc: "The Vaigai River is actively protected through AI-assisted monitoring. Citizens can upload photos of illegal dumping near or into the river, which are immediately flagged as high-risk and sent to municipal officials for enforcement and cleanup."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card p-8 hover:translate-y-[-4px] transition-all duration-300 border-white/5 hover:border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-black/50 py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A seamless lifecycle from capture to permanent prevention.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "1. Capture", desc: "Citizens or monitoring systems capture images of waste or violations." },
              { title: "2. Analyze", desc: "AI analyzes the image, identifies the waste category, and determines the underlying cause." },
              { title: "3. Predict", desc: "The system predicts recurrence risk using historical data and nearby activity patterns." },
              { title: "4. Prevent", desc: "Authorities receive actionable recommendations to eliminate waste at its source." }
            ].map((step, i) => (
              <div key={i} className="text-center p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary-blue/10 flex items-center justify-center mb-6 border border-primary-blue/20 text-primary-blue font-black text-xl">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participation Section */}
      <section className="w-full py-24 bg-gradient-to-b from-black/20 to-primary-green/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-green/20 flex items-center justify-center mx-auto mb-8 glow-green">
            <Heart className="w-8 h-8 text-primary-green" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Citizen Participation Matters</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Every report submitted strengthens the city’s cleanliness ecosystem. Citizen participation enables faster response, prevents repeated dumping, protects public health, and ensures a sustainable Madurai for future generations.
          </p>
        </div>
      </section>

      {/* Impact Snapshot */}
      <section className="w-full max-w-6xl mx-auto py-24 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-12 text-gray-300 tracking-wider uppercase">Impact Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { metric: "12,450+", label: "Waste Reports Analyzed", color: "text-primary-blue" },
            { metric: "85%", label: "Accuracy in Root Cause Identification", color: "text-primary-green" },
            { metric: "32%", label: "Reduction in Recurring Hotspots", color: "text-warning-amber" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="glass-card p-10 flex flex-col justify-center border-white/5 bg-black/20"
            >
              <h4 className={`text-5xl font-black mb-2 ${stat.color}`}>{stat.metric}</h4>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-primary-blue/10 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Be part of Madurai’s transformation.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-12 bg-black/40 p-8 rounded-3xl border border-white/10">
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-2 h-2 rounded-full bg-primary-green" /> Report waste.
              </li>
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-2 h-2 rounded-full bg-primary-blue" /> Protect the Vaigai River.
              </li>
            </ul>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-2 h-2 rounded-full bg-warning-amber" /> Support safe biomedical waste disposal.
              </li>
              <li className="flex items-center gap-3 text-lg font-medium">
                <div className="w-2 h-2 rounded-full bg-white" /> Build a cleaner Madurai with AI.
              </li>
            </ul>
          </div>
          <Link
            href="/auth/register"
            className="inline-flex bg-white text-black font-bold px-12 py-5 rounded-full hover:scale-[1.05] transition-transform text-xl shadow-2xl shadow-white/10"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg">ThoongaNagaram AI</span>
        </div>
        <p className="text-gray-500 text-sm max-w-xl mx-auto mb-4 px-6">
          ThoongaNagaram AI is designed for real-world municipal deployment, supporting smart city initiatives, environmental protection, and responsible urban living.
        </p>
        <p className="text-gray-600 text-xs mt-10">© 2026 ThoongaNagaram AI. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
