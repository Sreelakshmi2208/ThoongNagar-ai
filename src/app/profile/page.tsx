"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Trophy, Star, Shield, ArrowLeft, Loader2, Sparkles, MapPin, LogOut } from "lucide-react";

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [reportCount, setReportCount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        } else if (user) {
            fetchUserData();
        }
    }, [user, authLoading, router]);

    const fetchUserData = async () => {
        try {
            const userRef = doc(db, "users", user!.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setReportCount(userSnap.data().reportCount || 0);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const getBadgeStatus = () => {
        if (reportCount >= 10) return { title: "Gold City Guardian", icon: <Trophy className="w-12 h-12 text-yellow-400" />, level: 3 };
        if (reportCount >= 5) return { title: "Silver Activist", icon: <Shield className="w-12 h-12 text-gray-300" />, level: 2 };
        if (reportCount >= 1) return { title: "Bronze Contributor", icon: <Star className="w-12 h-12 text-amber-700" />, level: 1 };
        return { title: "Novice Spotter", icon: <Trophy className="w-12 h-12 text-gray-600 opacity-50" />, level: 0 };
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-green mb-4" />
                <p className="text-gray-400">Loading Citizen Profile...</p>
            </div>
        );
    }

    const badge = getBadgeStatus();
    const progressToNext = badge.level === 3 ? 100 : badge.level === 2 ? (reportCount / 10) * 100 : badge.level === 1 ? (reportCount / 5) * 100 : (reportCount / 1) * 100;

    return (
        <div className="min-h-screen pt-24 pb-10 px-6 max-w-4xl mx-auto flex flex-col gap-8">
            <header className="flex items-center gap-4">
                <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-3">
                        Citizen Impact Profile
                    </h1>
                    <p className="text-gray-400 mt-1">Track your contribution to Madurai's Cleanliness Revolution</p>
                </div>
                <button
                    onClick={logout}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-risk-red/10 text-risk-red hover:bg-risk-red text-sm font-bold transition-all border border-risk-red/20"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Profile Stats */}
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MapPin className="w-32 h-32" />
                    </div>
                    <div className="w-24 h-24 rounded-full bg-primary-green/20 border-2 border-primary-green flex items-center justify-center mb-6 z-10">
                        <span className="text-4xl font-black text-primary-green">{user?.email?.charAt(0).toUpperCase()}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1 z-10">{user?.email}</h2>
                    <p className="text-sm text-gray-400 mb-8 z-10">Registered Citizen of Madurai</p>

                    <div className="w-full grid grid-cols-2 gap-4 gap-y-6 text-left z-10 border-t border-white/10 pt-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Reports</p>
                            <p className="text-3xl font-black text-white">{reportCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Rank</p>
                            <p className="text-lg font-bold text-primary-green">{badge.title}</p>
                        </div>
                    </div>
                </div>

                {/* Gamification Badges */}
                <div className="glass-card p-8 flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-warning-amber" /> Community Badge
                    </h3>

                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-black/40 border border-white/10 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            {badge.icon}
                        </div>
                        {badge.level > 0 && (
                            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full z-0 animate-pulse"></div>
                        )}
                    </div>

                    <h4 className="text-2xl font-black mb-2">{badge.title}</h4>
                    <p className="text-sm text-gray-400 mb-8 max-w-xs">
                        {badge.level === 0 ? "Submit your first violation report to unlock your Bronze badge!" :
                            badge.level === 1 ? "Great start! Report 4 more critical areas to unlock Silver." :
                                badge.level === 2 ? "Incredible work. Only a few more to become a Gold City Guardian." :
                                    "You are an elite citizen! Madurai thanks you for your vigilance."}
                    </p>

                    <div className="w-full">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                            <span>Current Progress</span>
                            <span>{reportCount} / {badge.level === 3 ? "10+" : badge.level === 2 ? "10" : badge.level === 1 ? "5" : "1"}</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNext}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${badge.level === 3 ? 'bg-yellow-400' : badge.level === 2 ? 'bg-gray-300' : badge.level === 1 ? 'bg-amber-700' : 'bg-primary-green'}`}
                            ></motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
