"use client";

import { useState, useEffect } from "react";
import {
    Waves, AlertCircle, Droplets,
    Activity, Map as MapIcon, ShieldAlert,
    BarChart3, Thermometer, Wind,
    Eye, Search, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PollutionEvent {
    id: string;
    location: string;
    type: "Solid Waste" | "Chemical Runoff" | "Sewage Discharge";
    severity: "High" | "Medium" | "Low";
    timestamp: string;
    coordinates: { x: number; y: number };
}

export default function VaigaiMonitoring({ forceAlert = false }: { forceAlert?: boolean }) {
    const [waterQuality, setWaterQuality] = useState(68);
    const [events, setEvents] = useState<PollutionEvent[]>([
        { id: "EV-001", location: "Sellur Bridge", type: "Solid Waste", severity: "High", timestamp: "10 mins ago", coordinates: { x: 45, y: 30 } },
        { id: "EV-002", location: "Central Vaigai", type: "Sewage Discharge", severity: "Medium", timestamp: "1 hour ago", coordinates: { x: 60, y: 55 } },
    ]);
    const [scanning, setScanning] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<PollutionEvent | null>(null);

    useEffect(() => {
        if (forceAlert) {
            simulateScan();
        }
    }, [forceAlert]);

    const simulateScan = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            const newEvent: PollutionEvent = {
                id: `EV-${Math.floor(Math.random() * 900) + 100}`,
                location: ["Albert Victor Bridge", "Goripalayam", "Anna Nagar Bank"][Math.floor(Math.random() * 3)],
                type: "Solid Waste",
                severity: Math.random() > 0.5 ? "High" : "Medium",
                timestamp: "Just now",
                coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
            };
            setEvents(prev => [newEvent, ...prev.slice(0, 4)]);
            setWaterQuality(prev => Math.max(0, prev - 2));
        }, 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual Monitoring Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-card overflow-hidden h-[500px] relative border-primary-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    {/* Satellite Style Background */}
                    <div className="absolute inset-0 bg-[#051622] opacity-80" />

                    {/* Simulated River Vector */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300">
                        <path
                            d="M-50,150 C50,50 150,250 250,150 C350,50 450,150 450,150"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="40"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                    </svg>

                    {/* Scan Effect */}
                    <AnimatePresence>
                        {scanning && (
                            <motion.div
                                initial={{ top: "-100%" }}
                                animate={{ top: "100%" }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-primary-blue/50 z-10 shadow-[0_0_20px_rgba(59,130,246,1)]"
                            />
                        )}
                    </AnimatePresence>

                    {/* Interactive Points */}
                    {events.map((event) => (
                        <motion.button
                            key={event.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setSelectedPoint(event)}
                            className={`absolute w-4 h-4 rounded-full border-2 border-white z-20 ${event.severity === 'High' ? 'bg-risk-red animate-pulse' : 'bg-warning-amber'}`}
                            style={{ left: `${event.coordinates.x}%`, top: `${event.coordinates.y}%` }}
                        />
                    ))}

                    <div className="absolute top-4 left-4 z-20">
                        <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10">
                            <h3 className="text-xs font-bold text-primary-green mb-2 flex items-center gap-2">
                                <Waves className="w-3 h-3" /> VAIGAI LIVE FEED
                            </h3>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400">SAT: GSAT-324</p>
                                <p className="text-[10px] text-gray-400">COORD: 9.92°N 78.12°E</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-white/10 max-w-xs">
                            <AnimatePresence mode="wait">
                                {selectedPoint ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <p className="text-xs font-bold text-risk-red mb-1">{selectedPoint.severity.toUpperCase()} ALERT</p>
                                        <p className="text-sm font-bold">{selectedPoint.location}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{selectedPoint.type} detected via AI imaging.</p>
                                        <button className="mt-3 text-[10px] bg-primary-blue text-white px-3 py-1 rounded font-bold">DISPATCH DRONE</button>
                                    </motion.div>
                                ) : (
                                    <p className="text-xs text-gray-400">Select a monitoring point for AI diagnostics.</p>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={simulateScan}
                            disabled={scanning}
                            className="bg-primary-blue hover:bg-primary-blue/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-blue/30"
                        >
                            {scanning ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {scanning ? "Processing Imagery..." : "Run AI Scan"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 flex flex-col items-center">
                        <Thermometer className="w-5 h-5 text-warning-amber mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase">Temp</p>
                        <p className="font-bold">29.4 °C</p>
                    </div>
                    <div className="glass-card p-4 flex flex-col items-center">
                        <Droplets className="w-5 h-5 text-primary-blue mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase">DO Levels</p>
                        <p className="font-bold">4.2 mg/L</p>
                    </div>
                    <div className="glass-card p-4 flex flex-col items-center">
                        <Activity className="w-5 h-5 text-primary-green mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase">Flow Rate</p>
                        <p className="font-bold">12.5 m³/s</p>
                    </div>
                    <div className="glass-card p-4 flex flex-col items-center">
                        <Wind className="w-5 h-5 text-gray-400 mb-2" />
                        <p className="text-[10px] text-gray-500 uppercase">Turbidity</p>
                        <p className="font-bold">18 NTU</p>
                    </div>
                </div>
            </div>

            {/* Side Analytics */}
            <div className="space-y-6">
                <div className="glass-card p-6 border-primary-green/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full blur-3xl" />
                    <h3 className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-primary-green" /> WQI INDEX (Vaigai)
                    </h3>

                    <div className="flex flex-col items-center py-4">
                        <div className="text-5xl font-bold mb-2 transition-all" style={{ color: waterQuality > 60 ? '#22c55e' : waterQuality > 40 ? '#f59e0b' : '#ef4444' }}>
                            {waterQuality}
                        </div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Water Quality Index</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Industry Effluent</span>
                            <span className="font-bold">Low</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Illegal Dumping</span>
                            <span className="font-bold text-risk-red">High</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Citizen Awareness</span>
                            <span className="font-bold text-primary-green">Improving</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-white/5 h-[270px] overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary-blue" /> POLLUTION TIMELINE
                    </h3>
                    <div className="space-y-4 relative">
                        <div className="absolute left-[11px] top-2 bottom-0 w-px bg-white/10" />
                        {events.map((event, i) => (
                            <div key={i} className="flex items-start gap-4 relative z-10 transition-all hover:translate-x-1 cursor-pointer">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-background-dark ${event.severity === 'High' ? 'bg-risk-red/20 text-risk-red' : 'bg-warning-amber/20 text-warning-amber'}`}>
                                    <AlertCircle className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">{event.location}</p>
                                    <p className="text-[10px] text-gray-500">{event.timestamp} • {event.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
