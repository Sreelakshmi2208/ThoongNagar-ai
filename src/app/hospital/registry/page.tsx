"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Hospital, QrCode, AlertCircle, CheckCircle, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface HospitalData {
    id: string;
    name: string;
    address: string;
    lastDisposalDate: any;
    status: "Pending" | "Clean" | "High Alert";
}

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function HospitalRegistry() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || (role !== 'hospital' && role !== 'admin'))) {
            router.push('/auth/login');
        }
    }, [user, role, authLoading, router]);

    const maduraiHospitals = [
        { id: "HOSP-001", name: "Government Rajaji Hospital", address: "Panagal Rd, Madurai" },
        { id: "HOSP-002", name: "Apollo Specialty Hospital", address: "Lake View Rd, Madurai" },
        { id: "HOSP-003", name: "Velammal Medical College", address: "Madurai-Tuticorin Ring Rd" },
        { id: "HOSP-004", name: "Meenakshi Mission Hospital", address: "Melur Rd, Madurai" }
    ];

    useEffect(() => {
        const initHospitals = async () => {
            try {
                // Set a timeout for the firebase fetch
                const fetchPromise = getDocs(collection(db, "hospitals"));
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 5000)
                );

                const snapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;

                if (snapshot.empty) {
                    // Initialize with some mock data if empty
                    for (const h of maduraiHospitals) {
                        try {
                            await setDoc(doc(db, "hospitals", h.id), {
                                ...h,
                                lastDisposalDate: serverTimestamp(),
                                status: "Clean"
                            });
                        } catch (e) {
                            console.error("Error setting hospital doc:", e);
                        }
                    }
                    fetchHospitals();
                } else {
                    const data = snapshot.docs.map((doc: any) => {
                        const hospital = doc.data() as HospitalData;
                        return { ...hospital, id: doc.id };
                    }) as HospitalData[];
                    setHospitals(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Firebase init failed, using local mock data:", err);
                // Fallback to local mock data for demo/local dev without firebase
                const mockData = maduraiHospitals.map(h => ({
                    ...h,
                    lastDisposalDate: { toDate: () => new Date() },
                    status: "Clean" as const
                }));
                setHospitals(mockData);
                setLoading(false);
            }
        };

        const fetchHospitals = async () => {
            try {
                const snapshot = await getDocs(collection(db, "hospitals"));
                const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as HospitalData[];
                setHospitals(data);
            } catch (err) {
                console.error("Error fetching hospitals:", err);
            } finally {
                setLoading(false);
            }
        };

        initHospitals();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Clean": return "text-primary-green bg-primary-green/10 border-primary-green/20";
            case "Pending": return "text-warning-amber bg-warning-amber/10 border-warning-amber/20";
            case "High Alert": return "text-risk-red bg-risk-red/10 border-risk-red/20";
            default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-6 max-w-5xl mx-auto flex flex-col gap-8">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Hospital className="text-primary-blue" /> Safe Trace Registry
                    </h1>
                    <p className="text-gray-400">Madurai Hospital Biomedical Waste Monitoring</p>
                </div>
                <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Back to Admin
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 text-center py-20">
                        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading Registry...</p>
                    </div>
                ) : hospitals.map(hospital => (
                    <div key={hospital.id} className="glass-card p-6 border-white/10 hover:border-primary-blue/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(hospital.status)}`}>
                                {hospital.status.toUpperCase()}
                            </div>
                            <QrCode className="text-gray-500 group-hover:text-primary-blue transition-colors cursor-pointer" />
                        </div>

                        <h3 className="text-xl font-bold mb-1">{hospital.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                            <MapPin className="w-3 h-3" /> {hospital.address}
                        </p>

                        <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Last Disposal
                                </span>
                                <span className="text-white font-medium">
                                    {hospital.lastDisposalDate?.toDate ? hospital.lastDisposalDate.toDate().toLocaleDateString() : "Initializing..."}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 flex items-center gap-1">
                                    <QrCode className="w-3 h-3" /> QR ID
                                </span>
                                <span className="text-primary-blue font-mono font-bold tracking-wider">
                                    {hospital.id}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Link
                                href={`/hospital/scan/${hospital.id}`}
                                className="flex-1 py-2 text-center bg-primary-blue text-white rounded-lg text-sm font-bold hover:bg-primary-blue/90 glow-blue transition-all"
                            >
                                Simulate Scan
                            </Link>
                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium border border-white/10 transition-all">
                                View History
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-risk-red/10 border border-risk-red/30 flex items-start gap-4">
                <AlertCircle className="text-risk-red mt-1 shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-risk-red">Compliance Alert</h4>
                    <p className="text-xs text-gray-400 mt-1">
                        Hospitals marked as "Pending" or "High Alert" have failed to disposal waste within the last 3-4 days. This automatically triggers an escalation to Madurai Municipal Corporation.
                    </p>
                </div>
            </div>
        </div>
    );
}
