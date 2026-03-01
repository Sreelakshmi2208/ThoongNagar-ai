"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
    Camera, MapPin, Sparkles, Trophy,
    ShieldCheck, AlertTriangle, ArrowRight,
    Loader2, CheckCircle2, Shield, Star, Leaf, Waves, LogOut
} from "lucide-react";
import VaigaiMonitoring from "@/components/VaigaiMonitoring";

export default function DashboardHub() {
    const { user, role, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [reportCount, setReportCount] = useState<number | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<"hotspots" | "vaigai">("hotspots");

    useEffect(() => {
        // Load from cache first for immediate UI responsiveness
        const cachedCount = localStorage.getItem(`reportCount_${user?.uid}`);
        if (cachedCount) {
            setReportCount(parseInt(cachedCount));
            setLoadingData(false);
        }

        if (!authLoading && !user) {
            router.push("/auth/login");
        } else if (user && !authLoading) {
            if (role === 'admin') router.push('/admin');
            else if (role === 'hospital') router.push('/hospital/dashboard');
            else fetchUserData();
        }
    }, [user, role, authLoading, router]);

    const fetchUserData = async () => {
        try {
            const userRef = doc(db, "users", user!.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const count = userSnap.data().reportCount || 0;
                setReportCount(count);
                localStorage.setItem(`reportCount_${user?.uid}`, count.toString());
            } else {
                setReportCount(0);
            }
        } catch (error: any) {
            // Fail silently for offline/connectivity issues
            if (error.code !== 'unavailable' && !error.message?.includes('offline')) {
                console.error("Error fetching user data:", error);
            }
            // If we have no reportCount at all yet, default to 0
            if (reportCount === null) setReportCount(0);
        } finally {
            setLoadingData(false);
        }
    };

    const getBadgeStatus = () => {
        if (reportCount === null) return null;
        if (reportCount >= 10) return { title: "Gold City Guardian", icon: <Trophy className="w-10 h-10 text-yellow-400" /> };
        if (reportCount >= 5) return { title: "Silver Activist", icon: <Shield className="w-10 h-10 text-gray-300" /> };
        if (reportCount >= 1) return { title: "Bronze Contributor", icon: <Star className="w-10 h-10 text-amber-700" /> };
        return { title: "Willing Contributor", icon: <Leaf className="w-10 h-10 text-primary-green opacity-40" /> };
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-green mb-4" />
                <p className="text-gray-400">Loading Citizen Hub...</p>
            </div>
        );
    }

    const badge = getBadgeStatus();

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 sm:p-8 rounded-2xl glass-card border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />

                <div className="z-10">
                    <h1 className="text-3xl sm:text-4xl font-black mb-2">Welcome to <span className="text-primary-green">ThoongaNagaram AI Hub</span></h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
                        Citizen Account: {user?.email}
                    </p>
                </div>

                <div className="flex gap-4 z-10 w-full md:w-auto">
                    {user?.email === "admin@thoonganagaram.ai" && (
                        <button onClick={() => router.push('/admin')} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold bg-risk-red/20 text-risk-red hover:bg-risk-red/30 transition-colors border border-risk-red/30">
                            Admin Center
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/report')}
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold bg-primary-green text-black glow-green transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <Camera className="w-5 h-5" /> Report Waste
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-3 rounded-xl font-bold bg-white/5 text-gray-400 hover:bg-risk-red/20 hover:text-risk-red transition-all flex items-center justify-center gap-2 border border-white/10"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Progress & Classification */}
                <div className="lg:col-span-1 flex flex-col gap-6">

                    {/* User Progress Card */}
                    <div className="glass-card p-6 border-t-4 border-t-warning-amber">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-warning-amber" /> My Impact</h3>
                            <div className="flex gap-2">
                                <button onClick={fetchUserData} className="p-1.5 rounded-full hover:bg-white/10 transition-colors" title="Sync Progress">
                                    <Loader2 className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                                </button>
                                <button onClick={() => router.push('/profile')} className="text-xs text-primary-blue hover:underline">View Profile</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-black/50 border border-white/10 flex items-center justify-center relative shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                {badge?.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1 uppercase font-bold tracking-wider">Rank</p>
                                <p className="text-xl font-black">{badge?.title}</p>
                                <p className="text-sm mt-1 text-primary-green font-medium">{reportCount} Reports Submitted</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
                            Report violations to unlock higher tier badges and help keep Madurai clean!
                        </div>
                    </div>

                    {/* App Benefits & Categories */}
                    <div className="glass-card p-6 flex-1">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary-blue" /> System Intelligence</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 w-6 h-6 rounded bg-primary-green/20 text-primary-green flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-sm font-bold">Instant AI Analysis</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Diagnose root causes & get actionable solutions immediately.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 w-6 h-6 rounded bg-primary-blue/20 text-primary-blue flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-sm font-bold">Smart Command Routing</p>
                                    <p className="text-xs text-gray-400 mt-0.5">High-risk hotspots are automatically escalated to officials.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 w-6 h-6 rounded bg-warning-amber/20 text-warning-amber flex items-center justify-center shrink-0"><Leaf className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-sm font-bold">Waste Segregation</p>
                                    <p className="text-xs text-gray-400 mt-0.5">AI estimates Wet, Dry, and E-Waste percentages.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <p className="text-xs uppercase font-bold text-gray-500 mb-3">AI Detection Categories</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded">Commercial Bulk</span>
                                <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded">Illegal Dumping</span>
                                <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded">Market Overflow</span>
                                <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded">Construction Debris</span>
                                <span className="text-[10px] px-2 py-1 bg-risk-red/20 text-risk-red border border-risk-red/30 rounded font-bold">Hazardous</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Hotspots & Vaigai Monitor */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 self-start">
                        <button
                            onClick={() => setActiveTab("hotspots")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'hotspots' ? 'bg-primary-green text-black shadow-lg shadow-primary-green/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <MapPin className="w-3.5 h-3.5" /> City Hotspots
                        </button>
                        <button
                            onClick={() => setActiveTab("vaigai")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'vaigai' ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Waves className="w-3.5 h-3.5" /> Vaigai Protection
                        </button>
                    </div>

                    <div className="glass-card p-6 flex-1 min-h-[500px] flex flex-col relative overflow-hidden">
                        {activeTab === "hotspots" ? (
                            <>
                                <div className="absolute top-4 right-4 bg-primary-green/20 text-primary-green text-xs font-bold px-3 py-1 rounded-full animate-pulse border border-primary-green/30 z-20">
                                    Live Tracking Active
                                </div>

                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <MapPin className="text-risk-red w-6 h-6" /> Major Madurai Hotspots
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">Real-time aggregate view of flagged high-risk active zones.</p>

                                <div className="flex-1 w-full bg-black/50 rounded-xl border border-white/10 relative flex flex-col items-center justify-center overflow-hidden group">
                                    {/* Map Background Pattern */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

                                    {/* Interactive Nodes */}
                                    <div className="absolute top-[25%] left-[30%] text-center cursor-pointer hover:scale-110 transition-transform z-10">
                                        <div className="w-16 h-16 bg-risk-red/20 border-2 border-risk-red/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.3)] mb-2 relative">
                                            <div className="absolute inset-0 rounded-full border border-risk-red animate-[ping_2s_infinite]" />
                                            <AlertTriangle className="w-6 h-6 text-risk-red" />
                                        </div>
                                        <span className="bg-black/80 px-3 py-1 rounded text-xs font-bold backdrop-blur border border-white/10">Meenakshi Temple Zone</span>
                                    </div>

                                    <div className="absolute top-[60%] right-[25%] text-center cursor-pointer hover:scale-110 transition-transform z-10">
                                        <div className="w-12 h-12 bg-warning-amber/20 border-2 border-warning-amber/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,165,0,0.2)] mb-2">
                                            <span className="text-warning-amber font-bold text-xs">8</span>
                                        </div>
                                        <span className="bg-black/80 px-3 py-1 rounded text-[10px] font-bold backdrop-blur border border-white/10">Anna Nagar</span>
                                    </div>

                                    {/* Aesthetic overlay */}
                                    <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <button onClick={() => router.push('/report')} className="bg-black/60 hover:bg-black backdrop-blur px-6 py-3 rounded-full border border-white/20 text-sm font-bold shadow-xl transition-all flex items-center gap-2 mx-auto group-hover:-translate-y-2">
                                            Report New Hotspot <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                                            <Waves className="text-primary-blue w-6 h-6" /> Vaigai Protection Monitor
                                        </h3>
                                        <p className="text-sm text-gray-400">Join the movement to save Madurai&apos;s lifeline.</p>
                                    </div>
                                    <div className="bg-primary-blue/20 text-primary-blue text-[10px] font-bold px-3 py-1 rounded-full border border-primary-blue/30 uppercase tracking-widest">
                                        Satellite Link
                                    </div>
                                </div>
                                <div className="flex-1 rounded-xl overflow-hidden border border-white/5">
                                    <VaigaiMonitoring />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
