"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, ShieldCheck, Loader2, Hospital, QrCode, AlertCircle } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

export default function HospitalScan() {
    const { id } = useParams();
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hospital, setHospital] = useState<any>(null);
    const [scanned, setScanned] = useState(false);
    const [vanAssigned, setVanAssigned] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || (role !== 'hospital' && role !== 'admin'))) {
            router.push('/auth/login');
        }
    }, [user, role, authLoading, router]);

    useEffect(() => {
        const fetchHospital = async () => {
            if (!id) return;
            const docRef = doc(db, "hospitals", id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setHospital(docSnap.data());
            } else {
                setHospital("Not Found");
            }
            setLoading(false);

            // Auto-trigger scan for demo
            handleScan(id as string);
        };

        fetchHospital();
    }, [id]);

    const handleScan = async (hospitalId: string) => {
        setLoading(true);
        try {
            const docRef = doc(db, "hospitals", hospitalId);
            await updateDoc(docRef, {
                lastDisposalDate: serverTimestamp(),
                status: "Clean"
            });

            setScanned(true);

            // Simulate van assignment
            setTimeout(() => {
                setVanAssigned(true);
                setLoading(false);
            }, 2000);

        } catch (error) {
            console.error("Scan error:", error);
            setLoading(false);
        }
    };

    if (loading && !scanned) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 font-medium">Verifying QR Code {id}...</p>
            </div>
        );
    }

    if (hospital === "Not Found") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-risk-red mb-6 opacity-80" />
                <h1 className="text-2xl font-bold mb-2">Invalid QR Code</h1>
                <p className="text-gray-400 mb-8 max-w-sm">
                    This QR code is not registered in our ThoongaNagaram AI registry. Please contact the Municipal Corporation.
                </p>
                <Link href="/hospital/registry" className="bg-white/10 px-6 py-2 rounded-lg text-sm font-bold border border-white/5">
                    Back to Registry
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-primary-green/5 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-blue/5 blur-3xl rounded-full" />

            {/* Success Card */}
            <div className="glass-card w-full max-w-md p-8 relative z-10 border-primary-green/30 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-primary-green/20 flex items-center justify-center mb-6 glow-green relative">
                    <CheckCircle2 className="w-12 h-12 text-primary-green" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <QrCode className="w-3.5 h-3.5 text-black" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-primary-green">Safe Trace Verified</h1>
                <p className="text-gray-400 text-sm mb-6">QR Compliance successfully logged</p>

                <div className="w-full bg-black/40 p-5 rounded-xl border border-white/10 mb-8 space-y-4 text-left">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <Hospital className="w-5 h-5 text-primary-blue" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Hospital Facility</p>
                            <p className="font-bold text-lg">{hospital?.name}</p>
                            <p className="text-xs text-gray-500">{hospital?.id}</p>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 w-full" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Disposal Status</p>
                            <p className="text-primary-green font-bold text-lg">Logged Successfully</p>
                        </div>
                        <ShieldCheck className="text-primary-green w-8 h-8 opacity-50" />
                    </div>
                </div>

                {vanAssigned && (
                    <div className="w-full p-4 rounded-xl bg-primary-blue/10 border border-primary-blue/30 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary-blue glow-blue animate-pulse" />
                            <h4 className="text-xs font-bold text-primary-blue uppercase tracking-widest">Notification Sent</h4>
                        </div>
                        <p className="text-sm font-medium text-white text-left">
                            MMC Command Center notified. A specialized <span className="text-primary-blue font-bold">Biomedical Waste Van</span> is en route to your facility.
                        </p>
                    </div>
                )}

                {!vanAssigned && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic py-4">
                        <Loader2 className="w-4 h-4 animate-spin" /> Informing Command Center...
                    </div>
                )}

                <button
                    onClick={() => router.push('/hospital/registry')}
                    className="mt-8 text-sm font-bold text-gray-500 hover:text-white transition-colors"
                >
                    Return to Hub
                </button>
            </div>

            <div className="mt-8 flex flex-col items-center text-center opacity-40">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Government of Tamil Nadu</p>
                <p className="text-[10px] text-gray-500 font-medium">Madurai Municipal Corporation • Smart City Initiative</p>
            </div>
        </div>
    );
}
