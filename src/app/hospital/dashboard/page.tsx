"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
    Hospital, ShieldCheck, AlertTriangle,
    QrCode, History, LogOut, Loader2,
    CheckCircle2, Clock, MapPin, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

export default function HospitalDashboard() {
    const { user, role, loading, logout } = useAuth();
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [lastDisposal, setLastDisposal] = useState<string | null>(null);
    const [hospitalInfo, setHospitalInfo] = useState<{ id: string, name: string, status: string } | null>(null);
    const [showSetup, setShowSetup] = useState(false);
    const [setupName, setSetupName] = useState("");
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        if (!loading && (!user || role !== 'hospital')) {
            router.push('/auth/login');
        } else if (user && role === 'hospital') {
            checkHospitalRegistration();
        }
    }, [user, role, loading, router]);

    const checkHospitalRegistration = async () => {
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");

        // Use user ID as the base for Hospital ID if not specifically assigned
        const hospitalId = `HOSP-${user?.uid.substring(0, 5).toUpperCase()}`;
        const docRef = doc(db, "hospitals", hospitalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            setHospitalInfo({ id: hospitalId, name: data.name, status: data.status });
            if (data.lastDisposalDate) {
                const date = data.lastDisposalDate.toDate();
                setLastDisposal(date.toLocaleString());

                // Compliance Check: 4 days = 345,600,000 ms
                const diff = Date.now() - date.getTime();
                if (diff > 345600000 && data.status !== "Pending") {
                    updateComplianceStatus(hospitalId, "Pending");
                }
            }
        } else {
            setShowSetup(true);
        }
    };

    const updateComplianceStatus = async (id: string, status: string) => {
        const { db } = await import("@/lib/firebase");
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "hospitals", id), { status });
        setHospitalInfo(prev => prev ? { ...prev, status } : null);
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!setupName || isSettingUp) return;
        setIsSettingUp(true);
        try {
            const { db } = await import("@/lib/firebase");
            const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
            const hospitalId = `HOSP-${user?.uid.substring(0, 5).toUpperCase()}`;

            await setDoc(doc(db, "hospitals", hospitalId), {
                id: hospitalId,
                name: setupName,
                address: "Madurai Facility Zone",
                status: "Clean",
                lastDisposalDate: serverTimestamp(),
                registeredBy: user?.uid,
                createdAt: serverTimestamp()
            });

            setHospitalInfo({ id: hospitalId, name: setupName, status: "Clean" });
            setLastDisposal(new Date().toLocaleString());
            setShowSetup(false);
        } catch (e) {
            console.error("Setup failed:", e);
        } finally {
            setIsSettingUp(false);
        }
    };

    const handleSimulateScan = async () => {
        setIsScanning(true);
        try {
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const hospitalId = hospitalInfo?.id || `HOSP-${user?.uid.substring(0, 5).toUpperCase()}`;
            const docRef = doc(db, "hospitals", hospitalId);

            await updateDoc(docRef, {
                lastDisposalDate: serverTimestamp(),
                status: "Clean"
            });

            setTimeout(() => {
                setIsScanning(false);
                setScanComplete(true);
                setLastDisposal(new Date().toLocaleString());
                setTimeout(() => setScanComplete(false), 3000);
            }, 1000);
        } catch (e) {
            console.error("Simulation update failed:", e);
            setIsScanning(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 max-w-6xl mx-auto flex flex-col gap-8">
            <header className="flex justify-between items-center mt-12 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning-amber/20 flex items-center justify-center border border-warning-amber/50 glow-amber">
                        <Hospital className="text-warning-amber w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">SafeTrace Dashboard</h1>
                        <p className="text-sm text-gray-400">Biomedical Waste Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black/40 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
                        System Online
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-white transition-colors" title="Sign Out">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Stats & Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 border-warning-amber/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-warning-amber/5 rounded-full blur-3xl" />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold mb-1">Compliance Status</h2>
                                <p className="text-sm text-gray-400 mb-4">Official monitoring for {hospitalInfo?.name || user.displayName || "Facility User"}</p>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 ${hospitalInfo?.status === 'Pending' ? 'bg-risk-red/20 text-risk-red border-risk-red/30' : 'bg-primary-green/20 text-primary-green border-primary-green/30'}`}>
                                        <ShieldCheck className="w-4 h-4" /> {hospitalInfo?.status === 'Pending' ? 'OVERDUE' : 'COMPLIANT'}
                                    </span>
                                    <span className="text-xs text-gray-500">Facility ID: {hospitalInfo?.id}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Last Disposal</p>
                                    <p className="font-bold text-sm">{lastDisposal?.split(',')[0]}</p>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Pending Sync</p>
                                    <p className="font-bold text-sm text-primary-blue">0 Cases</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-primary-blue" /> RECENT DISPOSALS
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded bg-white/5">
                                                <QrCode className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">BATCH-#770{i}</p>
                                                <p className="text-[10px] text-gray-500">Hazardous • 12.5kg</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Mar {10 - i}, 2026</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6 border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-risk-red" /> RISK INDICATOR
                            </h3>
                            <div className="flex flex-col items-center justify-center h-full pb-6">
                                <div className="w-32 h-32 relative">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-white/5"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeDasharray={364}
                                            strokeDashoffset={364 - (364 * 15) / 100}
                                            strokeLinecap="round"
                                            fill="transparent"
                                            className="text-primary-green"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-bold">15%</span>
                                        <span className="text-[8px] uppercase tracking-widest text-gray-500">Low Risk</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 text-center">Current facility risk index is optimal.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Action Center */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-primary-blue/30 bg-primary-blue/5 glow-blue h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">QR Log Center</h2>
                            <p className="text-sm text-gray-400 mb-8">Scan QR codes on waste batches or generate a temporary facility ID for pickup verification.</p>

                            <div className="flex flex-col items-center gap-6">
                                <div className={`w-48 h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${isScanning ? 'border-primary-blue bg-primary-blue/10 animate-pulse' : 'border-white/20'}`}>
                                    {isScanning ? (
                                        <Loader2 className="w-10 h-10 text-primary-blue animate-spin" />
                                    ) : scanComplete ? (
                                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center px-4">
                                            <CheckCircle2 className="w-16 h-16 text-primary-green mb-2" />
                                            <p className="text-sm font-bold text-primary-green uppercase tracking-wider">Disposal Logged</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Smart City Command Center Notified</p>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center opacity-40">
                                            <QrCode className="w-12 h-12 mb-2" />
                                            <p className="text-[10px] uppercase font-bold tracking-widest">Ready for Scan</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full space-y-3">
                                    <button
                                        onClick={handleSimulateScan}
                                        disabled={isScanning || scanComplete}
                                        className="w-full py-4 bg-primary-blue text-white rounded-xl font-bold shadow-lg shadow-primary-blue/20 hover:bg-primary-blue/90 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isScanning ? "Processing QR..." : "Log Disposal Batch"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button
                                        onClick={() => setShowQR(true)}
                                        className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <QrCode className="w-4 h-4" /> Generate Pickup QR
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Modal */}
                        <AnimatePresence>
                            {showQR && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                                    onClick={() => setShowQR(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="glass-card max-w-sm w-full p-8 border-primary-blue/30 text-center flex flex-col items-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-primary-blue/20 flex items-center justify-center border border-primary-blue/50 glow-blue mb-6">
                                            <QrCode className="text-primary-blue w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Facility Pickup QR</h2>
                                        <p className="text-sm text-gray-400 mb-8">Present this code to the SafeTrace unit for verification.</p>

                                        <div className="bg-white p-4 rounded-2xl mb-8 shadow-2xl shadow-primary-blue/20">
                                            <QRCodeCanvas
                                                value={hospitalInfo?.id || user.uid}
                                                size={200}
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>

                                        <p className="font-mono text-xs text-primary-blue font-bold tracking-widest mb-8">
                                            {hospitalInfo?.id || "SHIELD-TRACE-ID"}
                                        </p>

                                        <button
                                            onClick={() => setShowQR(false)}
                                            className="w-full py-4 bg-primary-blue text-white font-bold rounded-xl shadow-lg shadow-primary-blue/20 hover:scale-[1.02] transition-transform"
                                        >
                                            Done
                                        </button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Setup Modal */}
                        <AnimatePresence>
                            {showSetup && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="glass-card max-w-md w-full p-8 border-warning-amber/30 text-center"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-warning-amber/20 flex items-center justify-center border border-warning-amber/50 glow-amber mx-auto mb-6">
                                            <Hospital className="text-warning-amber w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Hospital Activation</h2>
                                        <p className="text-sm text-gray-400 mb-8">Please enter your facility name to register for SafeTrace monitoring.</p>

                                        <form onSubmit={handleSetup} className="space-y-6">
                                            <div className="text-left">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Official Facility Name</label>
                                                <input
                                                    type="text"
                                                    value={setupName}
                                                    onChange={(e) => setSetupName(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-warning-amber/50 outline-none transition-all"
                                                    placeholder="e.g. Madurai City Hospital"
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSettingUp}
                                                className="w-full py-4 bg-warning-amber text-black font-bold rounded-xl shadow-lg shadow-warning-amber/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                            >
                                                {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate Facility Profile"}
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <p className="text-[10px] text-gray-500 text-center mt-6">
                            Ensure waste is properly segregated (Red/Yellow/Blue) before logging. <br />
                            <Link href="/hospital/registry" className="text-warning-amber underline">View Facility Registry</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Proximity Alert */}
            <div className="glass-card p-6 border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center border border-primary-blue/30">
                        <Clock className="text-primary-blue w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Scheduled Collection</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> SafeTrace Unit V-103 is 4.2km away
                        </p>
                    </div>
                </div>
                <div className="h-2 w-full md:w-64 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-primary-blue animate-pulse" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs font-bold text-primary-blue">ETA: 14 MIN</p>
            </div>
        </div>
    );
}
