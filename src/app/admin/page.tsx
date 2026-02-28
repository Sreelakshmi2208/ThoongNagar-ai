"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3, Map, ShieldCheck, AlertTriangle,
    MapPin, CheckCircle2, Clock, ListTodo,
    ChevronRight, LogOut, Bell
} from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

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
        wasteType: string;
        rootCause: string;
        behavioralCause: string;
        wasteSegregation: { wet: number; dry: number; hazardous: number };
        recurrenceProb: number;
        riskLevel: string;
        recommendedAction: string;
    };
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);

    useEffect(() => {
        if (activeTab === "reports") {
            fetchReports();
        }
    }, [activeTab]);

    const fetchReports = async () => {
        setLoadingReports(true);
        try {
            const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(reportsQuery);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoadingReports(false);
        }
    };

    const kpis = [
        { label: "Total Reports", value: "12,450", icon: <BarChart3 />, color: "text-primary-blue", bg: "bg-primary-blue/20", trend: "+12%" },
        { label: "High Risk Zones", value: "8", icon: <AlertTriangle />, color: "text-risk-red", bg: "bg-risk-red/20", trend: "-2" },
        { label: "Resolved Cases", value: "9,200", icon: <CheckCircle2 />, color: "text-primary-green", bg: "bg-primary-green/20", trend: "+450" },
        { label: "Avg Recurrence", value: "18%", icon: <Clock />, color: "text-warning-amber", bg: "bg-warning-amber/20", trend: "-5%" }
    ];

    const recentReports: { id: string; risk: string; type: string; location: string; status: string }[] = [
        { id: "REP-0102", risk: "Critical", type: "Market Waste Overflow", location: "Meenakshi Amman Temple Zone", status: "Pending" },
        { id: "REP-0101", risk: "Medium", type: "Illegal Dumping", location: "Sellur Line", status: "In Progress" },
        { id: "REP-0100", risk: "High", type: "Commercial Bulk Waste", location: "Anna Nagar", status: "Resolved" },
        { id: "REP-0099", risk: "Low", type: "Residential Overflow", location: "KK Nagar", status: "Pending" }
    ];

    const kanbanStages = ["Pending", "In Progress", "Completed"];

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

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
                        { id: "reports", label: "Master Reports", icon: <ListTodo className="w-5 h-5" /> },
                        { id: "analytics", label: "Root Cause Analytics", icon: <Map className="w-5 h-5" /> },
                        { id: "interventions", label: "Intervention Tracker", icon: <MapPin className="w-5 h-5" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-primary-blue/20 text-primary-blue shadow-[inset_2px_0_0_#00B0FF]"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button onClick={() => window.location.href = '/dashboard'} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5 rotate-180" /> Back to Hub
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-risk-red/10 hover:text-risk-red transition-all">
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
                                <img src="https://i.pravatar.cc/150?img=11" alt="Admin user" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-medium">Chief Commissioner</span>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
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
                                                <p className={`text-xs mt-2 font-medium ${kpi.trend.startsWith('+') ? 'text-primary-green' : 'text-risk-red'}`}>
                                                    {kpi.trend} from last month
                                                </p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-full ${kpi.bg} flex items-center justify-center`}>
                                                <div className={kpi.color}>{kpi.icon}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Heatmap Placeholder */}
                                    <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[400px]">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <MapPin className="text-warning-amber" /> Live Risk Heatmap
                                        </h3>
                                        <div className="flex-1 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                            {/* Abstract map representation */}
                                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                                            {/* Hotspots */}
                                            <div className="absolute top-[30%] left-[40%] w-32 h-32 bg-risk-red/40 blur-2xl rounded-full animate-pulse" />
                                            <div className="absolute top-[60%] left-[20%] w-24 h-24 bg-warning-amber/40 blur-xl rounded-full" />
                                            <div className="absolute top-[20%] right-[30%] w-20 h-20 bg-primary-blue/30 blur-xl rounded-full" />

                                            <p className="text-sm font-medium text-gray-400 z-10 bg-black/50 px-4 py-2 rounded-full backdrop-blur border border-white/10">
                                                Madurai Central Zone - Live Tracking
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recent Activity Feed */}
                                    <div className="glass-card p-6 flex flex-col h-[400px]">
                                        <h3 className="text-lg font-bold mb-4">Critical Alerts</h3>
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                            {recentReports.map((alert: any, i: number) => (
                                                <div key={i} className="p-4 rounded-lg bg-black/30 border border-white/5 hover:bg-black/50 transition-colors cursor-pointer border-l-2" style={{ borderLeftColor: alert.risk === 'Critical' ? 'var(--color-risk-red)' : alert.risk === 'High' ? 'var(--color-warning-amber)' : 'var(--color-primary-blue)' }}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-gray-400">{alert.id}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white bg-black/50`}>
                                                            {alert.risk}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-sm mb-1">{alert.type}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {alert.location}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "interventions" && (
                            <motion.div
                                key="interventions"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="h-[calc(100vh-140px)] flex flex-col"
                            >
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold">Intervention Tracker</h3>
                                        <p className="text-gray-400 mt-1">Manage AI-recommended preventive actions.</p>
                                    </div>
                                    <button className="glass-button px-4 py-2 text-sm text-primary-green">
                                        + New Intervention
                                    </button>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
                                    {kanbanStages.map((stage) => (
                                        <div key={stage} className="glass-card flex flex-col h-full bg-black/20 border-white/5">
                                            <div className="p-4 border-b border-white/10 shrink-0 flex justify-between items-center">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    {stage === 'Pending' && <span className="w-2 h-2 rounded-full bg-risk-red"></span>}
                                                    {stage === 'In Progress' && <span className="w-2 h-2 rounded-full bg-warning-amber"></span>}
                                                    {stage === 'Completed' && <span className="w-2 h-2 rounded-full bg-primary-green"></span>}
                                                    {stage}
                                                </h4>
                                                <span className="bg-white/10 px-2 py-1 rounded text-xs">
                                                    {stage === 'Pending' ? '4' : stage === 'In Progress' ? '2' : '15'}
                                                </span>
                                            </div>
                                            <div className="p-4 flex-1 overflow-y-auto space-y-4">
                                                {stage === 'Pending' && recentReports.slice(0, 2).map((item: any, i: number) => (
                                                    <div key={i} className="glass-card p-4 bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10">
                                                        <span className="text-xs text-primary-blue bg-primary-blue/10 px-2 py-1 rounded mb-2 inline-block">Infrastructure</span>
                                                        <p className="font-medium text-sm mb-3">Install 2 High-Capacity Bins</p>
                                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                                            <span>{item.location}</span>
                                                            <span className="text-risk-red">Due Today</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {stage === 'In Progress' && recentReports.slice(1, 2).map((item: any, i: number) => (
                                                    <div key={i} className="glass-card p-4 bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10">
                                                        <span className="text-xs text-warning-amber bg-warning-amber/10 px-2 py-1 rounded mb-2 inline-block">Enforcement</span>
                                                        <p className="font-medium text-sm mb-3">Targeted patrolling during 6PM-10PM</p>
                                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                                            <span>{item.location}</span>
                                                            <span className="text-warning-amber">Ongoing</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "reports" && (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold">Master Incident Reports</h3>
                                    <button onClick={fetchReports} className="glass-button px-4 py-2 text-sm">Refresh Data</button>
                                </div>

                                {loadingReports ? (
                                    <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div></div>
                                ) : reports.length === 0 ? (
                                    <div className="text-center py-20 bg-black/20 rounded-xl border border-white/5">
                                        <CheckCircle2 className="w-12 h-12 text-primary-green mx-auto mb-4 opacity-50" />
                                        <p className="text-gray-400">No reports documented yet. Madurai is clean!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {reports.map(report => (
                                            <div key={report.id} className="glass-card flex flex-col md:flex-row gap-6 p-6 overflow-hidden relative group">

                                                {/* Left: Image */}
                                                <div className="w-full md:w-1/3 aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                                    <img src={report.imageUrl} alt="Violation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>

                                                {/* Right: Data */}
                                                <div className="w-full md:w-2/3 flex flex-col gap-3">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-xl font-bold text-white">{report.analysis.wasteType}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.analysis.riskLevel === 'Critical' || report.analysis.riskLevel === 'High'
                                                            ? 'bg-risk-red text-white' : 'bg-warning-amber text-black'
                                                            }`}>
                                                            Risk: {report.analysis.riskLevel}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" /> {report.location || "Unknown Location"}
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                        <div className="bg-black/30 p-3 rounded border border-white/5 relative">
                                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Structural Root Cause</p>
                                                            <p className="text-sm">{report.analysis.rootCause}</p>
                                                        </div>
                                                        <div className="bg-black/30 p-3 rounded border border-white/5 relative">
                                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Human Behavior</p>
                                                            <p className="text-sm">{report.analysis.behavioralCause}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-primary-blue/10 border border-primary-blue/30 p-3 rounded mt-2">
                                                        <p className="text-xs text-primary-blue uppercase font-bold mb-1">AI Official Recommendation</p>
                                                        <p className="text-sm text-gray-200">{report.analysis.recommendedAction}</p>
                                                    </div>

                                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2 border-t border-white/10 pt-3">
                                                        <span>Reporter: {report.reporterEmail}</span>
                                                        <span>Recurrence Prob: <strong className={report.analysis.recurrenceProb > 70 ? "text-risk-red" : "text-primary-green"}>{report.analysis.recurrenceProb}%</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Placeholder for other tabs */}
                        {activeTab === "analytics" && (
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
                                <p className="text-gray-400 max-w-md">Data visualizations and comprehensive reporting will be available in the upcoming integration phase.</p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
