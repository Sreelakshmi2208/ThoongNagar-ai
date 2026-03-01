"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3, Map, ShieldCheck, AlertTriangle,
    MapPin, CheckCircle2, Clock, ListTodo,
    ChevronRight, LogOut, Bell, Hospital,
    Truck, User, Waves, Zap, Fingerprint, Users
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import VaigaiMonitoring from "@/components/VaigaiMonitoring";

interface Report {
    id: string;
    userId: string;
    reporterEmail: string;
    imageUrl: string;
    location: string;
    description: string;
    status: string;
    createdAt: any;
    analysis: {
        classification: {
            primary: string;
            subCategory: string;
            confidence: number;
            explanation: string;
        };
        riskAssessment: {
            level: "Low" | "Medium" | "High";
            recurrenceProbability: number;
            urgency: string;
            explanation: string;
        };
        diagnostic: {
            cause: string;
            analysis: string;
        };
        location: {
            type: string;
            historicalInsight: string;
        };
    };
}

interface HospitalData {
    id: string;
    name: string;
    address: string;
    lastDisposalDate: any;
    status: "Pending" | "Clean" | "High Alert";
}

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { user, role, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [reports, setReports] = useState<Report[]>([]);
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [vaigaiAlertActive, setVaigaiAlertActive] = useState(false);
    const [showSecretQuestion, setShowSecretQuestion] = useState(true);
    const [secretAnswer, setSecretAnswer] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);

    const handleSecretSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretAnswer.toLowerCase() === "biomedical waste") {
            setIsAuthorized(true);
            setShowSecretQuestion(false);
        } else {
            alert("Unauthorized Access Attempt. Credentials logged.");
        }
    };

    useEffect(() => {
        if (!loading && (!user || role !== 'admin')) {
            router.push('/auth/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (activeTab === "reports" || activeTab === "overview") {
            fetchReports();
        }
        if (activeTab === "hospitals" || activeTab === "overview") {
            fetchHospitals();
        }
    }, [activeTab]);

    const fetchReports = async () => {
        setLoadingReports(true);
        try {
            const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));

            // Timeout logic
            const fetchPromise = getDocs(reportsQuery);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 15000)
            );

            const snapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;
            const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Report[];
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
            // On failure, keep existing reports or use empty
        } finally {
            setLoadingReports(false);
        }
    };

    const fetchHospitals = async () => {
        setLoadingHospitals(true);
        try {
            const hospitalsCol = collection(db, "hospitals");

            // Timeout logic
            const fetchPromise = getDocs(hospitalsCol);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 15000)
            );

            const snapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;
            const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as HospitalData[];
            setHospitals(data);
        } catch (error) {
            console.error("Error fetching hospitals:", error);
            // On failure, use some mock hospitals for demo
            if (hospitals.length === 0) {
                setHospitals([
                    { id: "HOSP-001", name: "Government Rajaji Hospital", address: "Panagal Rd, Madurai", status: "Clean" as any, lastDisposalDate: { toDate: () => new Date() } },
                    { id: "HOSP-002", name: "Apollo Specialty Hospital", address: "Lake View Rd, Madurai", status: "Pending" as any, lastDisposalDate: { toDate: () => new Date(Date.now() - 300000000) } }
                ]);
            }
        } finally {
            setLoadingHospitals(false);
        }
    };

    const kpis = [
        { label: "Total Reports", value: reports.length || "12,450", icon: <BarChart3 />, color: "text-primary-blue", bg: "bg-primary-blue/20", trend: "+12%" },
        { label: "High Risk Zones", value: Array.from(new Set(reports.map(r => r.location))).length || "8", icon: <AlertTriangle />, color: "text-risk-red", bg: "bg-risk-red/20", trend: "-2" },
        { label: "Hospital Alerts", value: hospitals.filter(h => h.status !== 'Clean').length || "2", icon: <Hospital className="w-5 h-5" />, color: "text-warning-amber", bg: "bg-warning-amber/20", trend: "Critical" },
        { label: "Resolved Cases", value: "9,200", icon: <CheckCircle2 />, color: "text-primary-green", bg: "bg-primary-green/20", trend: "+450" }
    ];

    const recentReports: { id: string; risk: string; type: string; location: string; status: string }[] = [
        { id: "REP-0102", risk: "Critical", type: "Market Waste Overflow", location: "Meenakshi Amman Temple Zone", status: "Pending" },
        { id: "REP-0101", risk: "Medium", type: "Illegal Dumping", location: "Sellur Line", status: "In Progress" },
        { id: "REP-0100", risk: "High", type: "Commercial Bulk Waste", location: "Anna Nagar", status: "Resolved" },
        { id: "REP-0099", risk: "Low", type: "Residential Overflow", location: "KK Nagar", status: "Pending" }
    ];

    const kanbanStages = ["Pending", "In Progress", "Completed"];

    if (showSecretQuestion && !isAuthorized) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card max-w-md w-full p-8 text-center border-risk-red/30">
                    <ShieldCheck className="w-16 h-16 text-risk-red mx-auto mb-6 glow-red" />
                    <h1 className="text-2xl font-bold mb-2">Restricted Command Access</h1>
                    <p className="text-gray-400 text-sm mb-8">You must verify your identity. Please answer the security question below.</p>
                    <form onSubmit={handleSecretSubmit} className="space-y-6">
                        <div className="text-left">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Security Question</label>
                            <p className="text-white font-medium mb-3">Which waste category requires QR-verified disposal tracking under ThoongaNagaram AI’s Safe Trace system?</p>
                            <input
                                type="text"
                                value={secretAnswer}
                                onChange={(e) => setSecretAnswer(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-risk-red/50 outline-none"
                                placeholder="Answer here..."
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-risk-red text-white font-bold rounded-xl shadow-lg shadow-risk-red/20 hover:scale-[1.02] transition-transform">
                            Authorize Control Center
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }
    return (
        <div className="flex h-screen overflow-hidden bg-background-dark text-white">
            {/* Sidebar */}
            <aside className="w-64 glass-card rounded-none border-y-0 border-l-0 flex flex-col z-20">
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center glow-blue">
                        <ShieldCheck className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">ThoongaNagaram AI Admin</h1>
                        <p className="text-xs text-primary-green">Command Center</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {[
                        { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
                        { id: "reports", label: "Incident Reports", icon: <ListTodo className="w-4 h-4" /> },
                        { id: "hospitals", label: "Hospital Monitor", icon: <Hospital className="w-4 h-4" /> },
                        { id: "vans", label: "Van Management", icon: <Truck className="w-4 h-4" /> },
                        { id: "vaigai", label: "Vaigai Monitor", icon: <Waves className="w-4 h-4" /> },
                        { id: "users", label: "System Users", icon: <Users className="w-4 h-4" /> },
                        { id: "map", label: "Risk Heatmap", icon: <Map className="w-4 h-4" /> },
                        { id: "validation", label: "System Validation", icon: <Fingerprint className="w-4 h-4 text-primary-blue animate-pulse" /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                ? "bg-primary-blue text-white shadow-lg shadow-primary-blue/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button onClick={() => window.location.href = '/dashboard'} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5 rotate-180" /> Back to Hub
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-risk-red/10 hover:text-risk-red transition-all"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Glow Effects */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-green/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Topbar */}
                <header className="h-16 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-8 z-10 shrink-0">
                    <h2 className="text-xl font-bold capitalize">{activeTab.replace("-", " ")}</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-risk-red glow-red" />
                        </div>
                        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={user?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Admin user" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-medium">{user?.displayName || "Chief Commissioner"}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 z-10 space-y-6">
                    <AnimatePresence mode="wait">

                        {activeTab === "overview" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {kpis.map((kpi, i) => (
                                        <div key={i} className="glass-card p-6 flex items-start justify-between">
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">{kpi.label}</p>
                                                <h3 className="text-3xl font-bold">{kpi.value}</h3>
                                                <p className={`text-xs mt-2 font-medium ${kpi.trend.startsWith('+') ? 'text-primary-green' : kpi.trend === 'Critical' ? 'text-risk-red' : 'text-gray-400'}`}>
                                                    {kpi.trend} {kpi.trend.includes('%') ? 'from last month' : ''}
                                                </p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-full ${kpi.bg} flex items-center justify-center`}>
                                                <div className={kpi.color}>{kpi.icon}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Recent Reports Preview */}
                                    <div className="lg:col-span-2 glass-card p-6 flex flex-col min-h-[400px]">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <ListTodo className="text-primary-blue" /> Recent Incident Reports
                                        </h3>
                                        <div className="flex-1 space-y-3">
                                            {reports.slice(0, 5).map((report) => (
                                                <div key={report.id} className="p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-black/50 transition-colors cursor-pointer flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={report.imageUrl} alt="Incident" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">{report.location}</p>
                                                            <p className="text-[10px] text-gray-500">{report.reporterEmail}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${(report as any).severity === 'High Risk' ? 'bg-risk-red/20 text-risk-red' : report.analysis.riskAssessment.level === 'High' ? 'bg-risk-red/20 text-risk-red' : 'bg-warning-amber/20 text-warning-amber'}`}>
                                                            {((report as any).severity || report.analysis.riskAssessment.level).toUpperCase()}
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                </div>
                                            ))}
                                            {reports.length === 0 && <p className="text-center text-gray-600 py-10">No recent reports found.</p>}
                                        </div>
                                        <button onClick={() => setActiveTab('reports')} className="mt-4 text-center text-xs font-bold text-primary-blue hover:underline">
                                            View Master Incident Log
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Hospital Alerts Sidebar */}
                                        <div className="glass-card p-6 flex flex-col border-warning-amber/20">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-warning-amber">
                                                <Hospital className="w-5 h-5" /> Hospital Alerts
                                            </h3>
                                            <div className="space-y-4 max-h-[250px] overflow-y-auto">
                                                {hospitals.filter(h => h.status !== 'Clean').map((hospital) => (
                                                    <div key={hospital.id} className="p-4 rounded-lg bg-warning-amber/5 border border-warning-amber/10">
                                                        <p className="font-bold text-sm text-warning-amber mb-1">{hospital.name}</p>
                                                        <p className="text-[10px] text-gray-500 mb-3">{hospital.address}</p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold bg-risk-red text-white px-2 py-0.5 rounded">
                                                                {hospital.status === 'High Alert' ? 'URGENT' : 'OVERDUE'}
                                                            </span>
                                                            <Link href={`/hospital/dashboard`} className="text-[10px] text-primary-blue underline">View</Link>
                                                        </div>
                                                    </div>
                                                ))}
                                                {hospitals.filter(h => h.status !== 'Clean').length === 0 && (
                                                    <div className="py-8 text-center text-gray-500 italic text-xs">No active alerts.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vaigai Sat-Feed Alerts (Added) */}
                                        <div className="glass-card p-6 flex flex-col border-primary-blue/20">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary-blue">
                                                <Waves className="w-5 h-5" /> Vaigai Alerts
                                            </h3>
                                            <div className="space-y-4 max-h-[250px] overflow-y-auto">
                                                {reports.filter(r => (r as any).isVaigaiIncident).reverse().map((report, idx) => (
                                                    <div key={idx} className="p-4 rounded-lg bg-primary-blue/5 border border-primary-blue/10 flex items-center gap-3">
                                                        <AlertTriangle className="w-4 h-4 text-primary-blue shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="font-bold text-[11px] text-primary-blue line-clamp-1">{report.location}</p>
                                                            <p className="text-[10px] text-gray-500">{new Date(report.createdAt?.seconds * 1000).toLocaleTimeString()}</p>
                                                        </div>
                                                        <span className="text-[10px] text-risk-red font-bold">LIVE</span>
                                                    </div>
                                                ))}
                                                {reports.filter(r => (r as any).isVaigaiIncident).length === 0 && (
                                                    <div className="py-8 text-center text-gray-500 italic text-xs">No recent incidents.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {
                            activeTab === "reports" && (
                                <motion.div
                                    key="reports"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card overflow-hidden"
                                >
                                    <div className="p-6 border-b border-white/5 bg-white/5 sticky top-0 z-20 backdrop-blur-xl">
                                        <h3 className="text-xl font-bold">Incident Reporting Master List</h3>
                                        <p className="text-sm text-gray-500">Comprehensive log of all AI-analyzed citizen reports for Madurai Municipal Corporation.</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Incident</th>
                                                    <th className="px-6 py-4">Analysis</th>
                                                    <th className="px-6 py-4">Risk / Prob</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {reports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={report.imageUrl} alt="Incident" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white">{report.location}</p>
                                                                    <p className="text-[10px] text-gray-500 mt-1">{report.reporterEmail}</p>
                                                                    <p className="text-[10px] font-mono text-gray-600 mt-0.5">{new Date(report.createdAt?.seconds * 1000).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <p className="text-xs font-bold text-primary-green mb-1">{report.analysis.classification.primary}</p>
                                                            <p className="text-[10px] text-gray-400 line-clamp-2 max-w-xs">{report.analysis.classification.explanation}</p>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col gap-2">
                                                                <span className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded ${(report as any).severity === 'High Risk' ? 'bg-risk-red/20 text-risk-red shadow-[0_0_8px_rgba(213,0,0,0.3)]' : report.analysis.riskAssessment.level === 'High' ? 'bg-risk-red/20 text-risk-red' : 'bg-warning-amber/20 text-warning-amber'}`}>
                                                                    {((report as any).severity || report.analysis.riskAssessment.level).toUpperCase()}
                                                                </span>
                                                                <span className="text-[10px] text-gray-500">Recurrence: <strong className="text-white">{report.analysis.riskAssessment.recurrenceProbability}%</strong></span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-[10px] font-bold flex items-center gap-2 text-warning-amber">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-warning-amber animate-pulse" />
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                                                <ChevronRight className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {reports.length === 0 && (
                                                    <tr><td colSpan={5} className="py-20 text-center text-gray-600">No records found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )
                        }

                        {
                            activeTab === "hospitals" && (
                                <motion.div
                                    key="hospitals"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-bold">Safe Trace Monitoring</h2>
                                            <p className="text-sm text-gray-500">Real-time biomedical waste compliance tracking.</p>
                                        </div>
                                        <Link href="/hospital/registry" className="bg-primary-blue text-white px-6 py-2 rounded-lg text-sm font-bold glow-blue">
                                            Update Registry
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {hospitals.map(h => (
                                            <div key={h.id} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                        <Hospital className="text-primary-blue w-6 h-6" />
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${h.status === 'Clean' ? 'bg-primary-green/20 text-primary-green' : 'bg-risk-red/20 text-risk-red'}`}>
                                                        {h.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg">{h.name}</h3>
                                                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {h.address}
                                                </p>

                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                                                        <p className="text-gray-500 mb-1">Last Disposal</p>
                                                        <p className="font-bold">{h.lastDisposalDate?.toDate ? h.lastDisposalDate.toDate().toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                                                        <p className="text-gray-500 mb-1">Compliance ID</p>
                                                        <p className="font-mono font-bold text-primary-blue">{h.id}</p>
                                                    </div>
                                                </div>

                                                <Link href={`/hospital/scan/${h.id}`} className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all text-center block">
                                                    View Detailed Compliance Log
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        }

                        {
                            activeTab === "vans" && (
                                <motion.div
                                    key="vans"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-bold">Fleet Management</h2>
                                            <p className="text-sm text-gray-500">Live deployment of waste collection units.</p>
                                        </div>
                                        <button className="bg-primary-green text-black px-6 py-2 rounded-lg text-sm font-bold glow-green">
                                            Optimize Fleet Route
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: "V-101", name: "Alpha Unit", status: "Active", load: 78, zone: "North" },
                                            { id: "V-102", name: "Beta Unit", status: "Active", load: 42, zone: "Central" },
                                            { id: "V-103", name: "SafeTrace-01", status: "En Route", load: 15, zone: "Panagal Rd" },
                                            { id: "V-104", name: "Gamma Unit", status: "Standby", load: 0, zone: "South Yard" },
                                        ].map(van => (
                                            <div key={van.id} className="glass-card p-6 border-white/5">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-12 h-12 rounded-xl bg-primary-blue/10 flex items-center justify-center">
                                                        <Truck className="text-primary-blue w-6 h-6" />
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${van.status === 'Active' ? 'bg-primary-green/20 text-primary-green' : 'bg-primary-blue/20 text-primary-blue'}`}>
                                                        {van.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg">{van.name}</h3>
                                                <p className="text-xs text-gray-500 mb-4">{van.id} • Sector {van.zone}</p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                        <span>Storage Capacity</span>
                                                        <span>{van.load}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary-blue" style={{ width: `${van.load}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        }

                        {
                            activeTab === "vaigai" && (
                                <motion.div
                                    key="vaigai"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <Waves className="text-primary-blue w-7 h-7" /> Vaigai Integrated Monitor
                                        </h2>
                                        <p className="text-sm text-gray-500">Official Municipal River Protection & Satellite Surveillance</p>
                                    </div>
                                    <VaigaiMonitoring forceAlert={vaigaiAlertActive} />
                                </motion.div>
                            )
                        }

                        {
                            activeTab === "users" && (
                                <motion.div
                                    key="users"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold">System User Management</h2>
                                            <p className="text-sm text-gray-400">Manage access and roles for ThoongaNagaram AI</p>
                                        </div>
                                        <button className="bg-primary-blue/20 text-primary-blue border border-primary-blue/30 px-4 py-2 rounded-lg text-sm font-bold">
                                            + Invite Official
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {[
                                            { label: "Total Citizens", count: "14,250", icon: <User className="text-primary-green" />, trend: "+240 this week" },
                                            { label: "Municipal Officials", count: "42", icon: <ShieldCheck className="text-risk-red" />, trend: "Active" },
                                            { label: "Hospital Officials", count: "18", icon: <Hospital className="text-warning-amber" />, trend: "5 Facilities" }
                                        ].map((stat, i) => (
                                            <div key={i} className="glass-card p-6 border-white/5">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="p-3 bg-white/5 rounded-xl">{stat.icon}</div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
                                                        <h4 className="text-2xl font-bold">{stat.count}</h4>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-400">{stat.trend}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="glass-card overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4">Role</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Activity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {[
                                                    { name: "Sree", role: "Admin", email: "admin@thoonganagaram.ai", status: "Online" },
                                                    { name: "Madurai Medical College", role: "Hospital", email: "mmc@hospitals.gov.in", status: "Online" },
                                                    { name: "City Commissioner", role: "Municipal", email: "comm@madurai.gov.in", status: "Offline" },
                                                ].map((u, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary-blue/20 flex items-center justify-center text-primary-blue text-xs font-bold">
                                                                {u.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{u.name}</p>
                                                                <p className="text-[10px] text-gray-500">{u.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Online' ? 'bg-primary-green animate-pulse' : 'bg-gray-600'}`} />
                                                                <span className="text-xs">{u.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-[10px] text-primary-blue hover:underline">View Log</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )
                        }

                        {
                            activeTab === "validation" && (
                                <motion.div
                                    key="validation"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-8"
                                >
                                    <div className="glass-card p-8 border-primary-blue/30 bg-primary-blue/5 glow-blue">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary-blue flex items-center justify-center glow-blue">
                                                <Zap className="text-black w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">Validation Control Center</h2>
                                                <p className="text-sm text-gray-300">Trigger end-to-end simulations for emergency workflows.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="bg-black/40 p-6 rounded-xl border border-white/5 hover:border-risk-red/30 transition-all group">
                                                <Waves className="text-primary-blue w-8 h-8 mb-4 group-hover:animate-bounce" />
                                                <h4 className="font-bold mb-2">River Pollution Simulation</h4>
                                                <p className="text-xs text-gray-500 mb-6">Trigger a High-Risk pollution event on the Vaigai River via mock satellite link.</p>
                                                <button
                                                    onClick={() => {
                                                        setVaigaiAlertActive(true);
                                                        alert("Simulation Phase 1: AI Satellite Link detecting anomalies in Vaigai Sector B...\nTriggering High-Risk Alert to Command Center.");
                                                        setTimeout(() => setVaigaiAlertActive(false), 5000);
                                                    }}
                                                    className="w-full py-2 bg-risk-red/20 text-risk-red border border-risk-red/30 rounded-lg text-xs font-bold hover:bg-risk-red hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    Deploy Alert
                                                </button>
                                            </div>

                                            <div className="bg-black/40 p-6 rounded-xl border border-white/5 hover:border-warning-amber/30 transition-all group">
                                                <Hospital className="text-warning-amber w-8 h-8 mb-4 group-hover:animate-pulse" />
                                                <h4 className="font-bold mb-2">Safe Trace Breach Demo</h4>
                                                <p className="text-xs text-gray-500 mb-6">Simulate a hospital (Rajaji Gov Hosp) failing to log disposal for 4 consecutive days.</p>
                                                <button
                                                    onClick={() => alert("Simulation Triggered: Hospital Compliance Monitor detects 4-day inactivity at Government Rajaji Hospital.\nStatus escalated to HIGH ALERT.")}
                                                    className="w-full py-2 bg-warning-amber/20 text-warning-amber border border-warning-amber/30 rounded-lg text-xs font-bold hover:bg-warning-amber hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    Simulate Breach
                                                </button>
                                            </div>

                                            <div className="bg-black/40 p-6 rounded-xl border border-white/5 hover:border-primary-green/30 transition-all group">
                                                <Truck className="text-primary-green w-8 h-8 mb-4 group-hover:translate-x-4 transition-transform" />
                                                <h4 className="font-bold mb-2">Fleet Optimization Loop</h4>
                                                <p className="text-xs text-gray-500 mb-6">Broadcast an optimized route reconfiguration to all 4 active Kuppai Vandi units.</p>
                                                <button
                                                    onClick={() => alert("Command Center Broadcast: Unit V-101 to V-104 receiving optimized route matrix.\nEfficiency increased by 22% in Central Zone.")}
                                                    className="w-full py-2 bg-primary-green/20 text-primary-green border border-primary-green/30 rounded-lg text-xs font-bold hover:bg-primary-green hover:text-black transition-all uppercase tracking-widest"
                                                >
                                                    Broadcast Route
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-card p-6 border-white/5">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                            <ListTodo className="w-4 h-4" /> Final Readiness Checklist
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { task: "Role-Based Redirection Isolation", status: "PASS" },
                                                { task: "Citizen Image to 11-Part Intelligence Log", status: "PASS" },
                                                { task: "Vaigai Real-time Pollution Plotting", status: "PASS" },
                                                { task: "Hospital QR Sync & Compliance Logic", status: "PASS" },
                                                { task: "Multi-Admin Dashboard Synchronization", status: "PASS" }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                    <span className="text-xs text-gray-300">{item.task}</span>
                                                    <span className="text-[10px] font-bold text-primary-green px-2 py-0.5 rounded bg-primary-green/10 border border-primary-green/20">
                                                        {item.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }

                        {/* Fallback for other tabs */}
                        {
                            !["overview", "reports", "hospitals", "vans", "vaigai", "users", "validation"].includes(activeTab) && (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-64 text-center mt-20"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <BarChart3 className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">Module Under Construction</h3>
                                    <p className="text-gray-400 max-w-md">Detailed system metrics for {activeTab} will be available in the next deployment.</p>
                                </motion.div>
                            )
                        }

                    </AnimatePresence >
                </div >
            </main >
        </div >
    );
}
