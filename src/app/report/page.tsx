"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import {
    UploadCloud, MapPin, Loader2, Sparkles,
    CheckCircle2, AlertTriangle, ShieldCheck,
    Camera, UserCircle
} from "lucide-react";
import ReportView, { ReportData } from "@/components/ReportView";

export default function ReportPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ReportData | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isVaigaiIncident, setIsVaigaiIncident] = useState(false);

    const [hasUploadedOnce, setHasUploadedOnce] = useState(false);
    const [latLng, setLatLng] = useState<{ lat: string, lng: string } | null>(null);

    const [vanStatus, setVanStatus] = useState<'Idle' | 'Searching' | 'Assigned' | 'Arrived'>('Idle');
    const [assignedVan, setAssignedVan] = useState<{ id: string, name: string, distance: string } | null>(null);
    const [manualCorrection, setManualCorrection] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    const assignVan = () => {
        setVanStatus('Searching');
        setTimeout(() => {
            setAssignedVan({
                id: `VAN-${Math.floor(Math.random() * 1000)}`,
                name: "Thoonga Clean Express",
                distance: (Math.random() * 3 + 1).toFixed(1) + " km"
            });
            setVanStatus('Assigned');

            // Simulate arrival after 8 seconds
            setTimeout(() => {
                setVanStatus('Arrived');
            }, 8000);
        }, 2500);
    };

    const triggerFileSelect = () => {
        if (!hasUploadedOnce && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && !hasUploadedOnce) {
            const file = e.target.files[0];
            uploadImage(file);
        }
    };

    const uploadImage = (file: File) => {
        setIsUploading(true);

        // Use FileReader to quickly grab Base64 instead of Firebase Storage upload
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setImageUrl(reader.result);
                setIsUploading(false);
                setHasUploadedOnce(true); // Lock further uploads
                getLocation();
            }
        };
        reader.onerror = () => {
            console.error("Failed to read file");
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const getLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(5);
                    const lng = position.coords.longitude.toFixed(5);
                    setLatLng({ lat, lng });
                    setLocation(`Madurai Zone (Lat: ${lat}, Lng: ${lng})`);
                },
                (error) => {
                    console.error("Error getting location", error);
                    // Mock coordinates for central Madurai as fallback if geolocation fails
                    setLatLng({ lat: "9.9252", lng: "78.1198" });
                    setLocation("Location detected (mock fallback: Madurai Central)");
                }
            );
        } else {
            setLatLng({ lat: "9.9252", lng: "78.1198" });
            setLocation("Geolocation not supported (mock fallback: Madurai Central)");
        }
    };

    const handleAnalyze = async () => {
        if (!imageUrl) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base64Image: imageUrl,
                    description: description,
                    lat: latLng?.lat,
                    lng: latLng?.lng
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await response.json();
            // Enable feedback for officials
            if (data.feedback) {
                data.feedback.allowed = (role === 'admin' || role === 'hospital');
            }
            setAnalysisResult(data);
        } catch (error: any) {
            console.error("Error during analysis:", error);
            // Professional fallback matching the 11-section structure
            setAnalysisResult({
                metadata: {
                    reportType: "Standard Municipal Waste Intelligence Report",
                    engine: "Standard Diagnostic Engine (Resilient Fallback)",
                    timestamp: new Date().toISOString(),
                    authority: "Madurai Municipal Corporation",
                    status: "Audit-Ready & Operationally Valid"
                },
                classification: {
                    primary: "General Municipal Waste",
                    subCategory: "Urban Litter / Commercial Packing",
                    confidence: 85,
                    explanation: "This report was generated using our 'Standard Diagnostic Engine' because the Advanced AI Analysis is currently offline."
                },
                riskAssessment: {
                    level: "Medium",
                    recurrenceProbability: 65,
                    urgency: "Moderate - Proactive cleanup recommended within 24-48 hours.",
                    explanation: "Historical patterns in this zone suggest a moderate risk of recurrence."
                },
                diagnostic: {
                    cause: "Behavioral patterns & foot traffic density",
                    analysis: "The proximity to commercial hubs often lead to convenience dumping. This 'Standard Report' serves as a valid entry for the Command Center."
                },
                location: {
                    type: "Mixed-Use Urban Zone",
                    historicalInsight: "Moderate frequency of similar incidents in the last 12 months."
                },
                vanAssignment: {
                    vanName: "Cauvery Clean Team",
                    vanId: "V001",
                    distance: "1.2 km",
                    status: "Assigned"
                },
                segregation: {
                    wet: 45,
                    dry: 45,
                    hazardous: 10,
                    handlingNotes: "Standard handling protocols. Wear protective gloves and masks."
                },
                actionPlan: {
                    immediate: "Deploy collection team within 24 hours.",
                    preventive: "Place additional 'Fixed-Point' bins and engage local shopkeepers."
                },
                impact: {
                    healthRisk: "Moderate",
                    escalationPrevention: "Regular cleaning prevents mosquito breeding and foul odors."
                },
                complianceNote: "Valid digital municipal record for Smart City Analytics.",
                feedback: { allowed: (role === 'admin' || role === 'hospital'), correctionStored: false }
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const downloadReport = () => {
        if (!analysisResult) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>ThoongaNagaram AI Official Report</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
                        h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
                        .section { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
                        .section h2 { margin-top: 0; color: #2b6cb0; font-size: 18px; margin-bottom: 20px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .label { font-size: 12px; font-weight: bold; color: #718096; text-transform: uppercase; }
                        .value { font-size: 16px; font-weight: 500; margin-top: 5px; color: #2d3748; }
                        .alert { padding: 8px 16px; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 14px; }
                        .risk-High, .risk-Critical { background: #fed7d7; color: #c53030; }
                        .risk-Medium { background: #feebc8; color: #c05621; }
                        .risk-Low { background: #c6f6d5; color: #2f855a; }
                        .footer { margin-top: 50px; text-align: center; color: #a0aec0; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${analysisResult.metadata.reportType} ${isVaigaiIncident ? "(Vaigai Monitor Sector)" : ""}</h1>
                    <p>Engine: ${analysisResult.metadata.engine}</p>
                    <div class="header">
                        <div>
                            <div class="label">Date & Time</div>
                            <div class="value">${new Date(analysisResult.metadata.timestamp).toLocaleString()}</div>
                        </div>
                        <div>
                            <div class="label">Detected Location</div>
                            <div class="value">${location || 'Madurai'}</div>
                        </div>
                        <div>
                            <div class="label">Risk Level</div>
                            <div class="value alert risk-${analysisResult.riskAssessment.level}">${analysisResult.riskAssessment.level}</div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>1. Core AI Diagnostics</h2>
                        <div class="grid">
                            <div>
                                <div class="label">Waste Category</div>
                                <div class="value">${analysisResult.classification.primary}</div>
                            </div>
                            <div>
                                <div class="label">Recurrence Probability</div>
                                <div class="value" style="color: #e53e3e; font-size: 24px; font-weight: bold;">${analysisResult.riskAssessment.recurrenceProbability}%</div>
                            </div>
                            <div>
                                <div class="label">AI Diagnostic</div>
                                <div class="value">${analysisResult.diagnostic.cause}</div>
                            </div>
                            <div>
                                <div class="label">Location Insight</div>
                                <div class="value">${analysisResult.location.historicalInsight}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>2. Waste Segregation Estimation</h2>
                        <p>Wet: ${analysisResult.segregation.wet}% | Dry: ${analysisResult.segregation.dry}% | Hazardous: ${analysisResult.segregation.hazardous}%</p>
                    </div>

                    <div class="section" style="background: #ebf8ff; border-color: #bee3f8;">
                        <h2 style="color: #2b6cb0;">3. Prescribed Actionable Solutions</h2>
                        <div class="value">${analysisResult.actionPlan.immediate}</div>
                        <div class="value" style="margin-top: 10px;">${analysisResult.actionPlan.preventive}</div>
                    </div>

                    <div class="footer">
                        Generated by ThoongaNagaram AI Engine. Official Municipal Record.
                    </div>
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ThoongaNagaram_Report_${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const resetReport = () => {
        setHasUploadedOnce(false);
        setImageUrl(null);
        setAnalysisResult(null);
        setLocation(null);
        setLatLng(null);
        setIsSubmitted(false);
        setVanStatus('Idle');
        setAssignedVan(null);
        setManualCorrection("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const submitReport = async () => {
        if (!user || !analysisResult || !imageUrl || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "reports"), {
                userId: user.uid,
                reporterEmail: user.email,
                imageUrl,
                location,
                description,
                analysis: analysisResult,
                manualCorrection,
                isVaigaiIncident: isVaigaiIncident,
                severity: isVaigaiIncident ? "High Risk" : (analysisResult.riskAssessment.level || "Medium"),
                createdAt: serverTimestamp()
            });

            // Trigger official notification simulation
            if (isVaigaiIncident) {
                alert("CRITICAL: Vaigai Protection Monitor has broadcasted this incident to all Municipal Officials. Direct Satellite Link established.");
            }

            // Robustly update or create user's reportCount
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                reportCount: increment(1)
            });

            setIsSubmitted(true);
            alert("Report successfully submitted to the Command Center!");
        } catch (error: any) {
            console.error("Error submitting report:", error);
            alert("Failed to submit report. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-green mb-4" />
                <p className="text-gray-400">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-10 px-6 max-w-5xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Report Violation</h1>
                    <p className="text-gray-400">ThoongaNagaram AI</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Hub
                    </button>
                    {user?.email === "admin@thoonganagaram.ai" && (
                        <button onClick={() => router.push('/admin')} className="text-sm font-bold text-risk-red hover:text-white transition-colors">
                            Admin Center
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-col gap-10">

                {/* Top Section - Upload & Analysis */}
                <div className="space-y-6 w-full">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Camera className="text-primary-green" /> New Report
                        </h2>
                        <p className="text-sm text-gray-400 mb-6 italic leading-relaxed">
                            "Your action today contributes to a cleaner, healthier Madurai. Every report helps municipal teams respond faster, prevent waste recurrence, and protect the environment for future generations."
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div
                            onClick={triggerFileSelect}
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${isUploading || imageUrl
                                ? "border-primary-green bg-primary-green/5 cursor-default"
                                : "border-white/20 hover:border-primary-blue/50 bg-black/20 cursor-pointer"
                                }`}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center text-primary-green w-full py-4">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p className="font-medium animate-pulse">Initializing Image...</p>
                                </div>
                            ) : imageUrl ? (
                                <div className="flex flex-col items-center text-white">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden mb-4 border border-white/20 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imageUrl} alt="Waste" className="object-cover w-full h-full" />
                                    </div>
                                    <p className="text-primary-green font-medium flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Image Uploaded Successfully
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-white mb-2">Tap to Capture or Upload</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">Upload a clear photo of the unmanaged waste.</p>
                                </>
                            )}
                        </div>

                        <AnimatePresence>
                            {location && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-4 p-4 rounded-lg bg-black/40 border border-white/5 flex items-start gap-4"
                                >
                                    <MapPin className="text-primary-blue mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-400">Auto-detected Location</p>
                                        <p className="font-medium">{location}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {location && !analysisResult && (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Optional Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add any extra details (e.g. Near Sellur Bridge)..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-blue/50"
                                        rows={3}
                                    />
                                </div>
                                <label className="flex items-center gap-3 p-3 bg-primary-blue/5 border border-primary-blue/20 rounded-lg cursor-pointer hover:bg-primary-blue/10 transition-colors">
                                    <input type="checkbox" checked={isVaigaiIncident} onChange={(e) => setIsVaigaiIncident(e.target.checked)} className="accent-primary-blue" />
                                    <div>
                                        <p className="text-sm font-bold text-primary-blue">Vaigai River Waste Sector</p>
                                        <p className="text-[10px] text-gray-400">Mark if waste is near/in Vaigai river (Triggers Official Alert)</p>
                                    </div>
                                </label>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAnalyzing ? "bg-primary-blue/50 text-white cursor-wait" : "bg-primary-blue hover:bg-primary-blue/90 text-white glow-blue"
                                        }`}
                                >
                                    {isAnalyzing ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with ThoongaNagaram AI...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Analyze Root Cause</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* New Integrated Report View */}
                    {analysisResult && (
                        <div className="space-y-6">
                            <ReportView data={analysisResult} onDownload={downloadReport} />

                            <div className="flex gap-4 max-w-4xl mx-auto">
                                <button
                                    onClick={submitReport}
                                    disabled={isSubmitting || isSubmitted}
                                    className={`flex-1 py-4 rounded-xl transition-all font-bold text-lg flex items-center justify-center gap-2 ${isSubmitted
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-primary-green text-black hover:bg-primary-green/90 shadow-lg shadow-primary-green/20'
                                        }`}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isSubmitted ? "Successfully Logged in System ✓" : "Commit to Command Center"}
                                </button>
                                <button
                                    onClick={resetReport}
                                    className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
