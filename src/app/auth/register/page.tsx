"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight, MapPin } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [hospitalName, setHospitalName] = useState("");
    const [location, setLocation] = useState<{ lat: number, lng: number, zone: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    // For demo, we assign a zone based on lat/lng or just a default
                    const zone = lat > 9.93 ? "Madurai North" : "Madurai South";
                    setLocation({ lat, lng, zone });
                },
                (err) => {
                    console.error("Location error:", err);
                    // Mock location for Madurai
                    setLocation({ lat: 9.9252, lng: 78.1198, zone: "Madurai Central" });
                }
            );
        } else {
            setLocation({ lat: 9.9252, lng: 78.1198, zone: "Madurai Central" });
        }
    }, []);

    const [role, setRole] = useState("citizen");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const registrationTask = async () => {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // Store additional user info in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                role: role,
                hospitalName: role === 'hospital' ? hospitalName : null,
                reportCount: 0,
                location: location || { lat: 9.9252, lng: 78.1198, zone: "Madurai Central" },
                createdAt: serverTimestamp()
            });

            // Role-based redirection
            if (role === "admin") router.push("/admin");
            else if (role === "hospital") router.push("/hospital/dashboard");
            else router.push("/dashboard");
        };

        try {
            // Set a timeout for the firebase fetch
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Firebase Timeout")), 20000)
            );

            await Promise.race([registrationTask(), timeoutPromise]);
        } catch (err: any) {
            console.error("Registration issue:", err);
            if (err.message === "Firebase Timeout") {
                // Demo Mode Fallback: Redirect anyway to allow exploring
                console.log("Entering Demo Mode due to Firebase timeout");
                router.push("/dashboard");
            } else {
                setError(err.message || "Failed to create account");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
                {/* Glow effect background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-blue/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary-green/20 rounded-full flex items-center justify-center mb-4 glow-green">
                        <UserPlus className="text-primary-green w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-gray-400 text-sm mt-2 text-center">
                        Join the movement for a cleaner Madurai
                    </p>
                </div>

                {error && (
                    <div className="bg-risk-red/20 border border-risk-red text-white text-sm px-4 py-2 rounded-lg mb-4 relative z-10 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="relative z-10 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">I am registering as a:</label>
                        <div className="grid grid-cols-1 gap-2">
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${role === 'citizen' ? 'bg-primary-green/20 border-primary-green' : 'bg-black/20 border-white/10 hover:border-white/20'}`}>
                                <input type="radio" name="role" value="citizen" checked={role === 'citizen'} onChange={() => setRole('citizen')} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'citizen' ? 'border-primary-green' : 'border-gray-500'}`}>
                                    {role === 'citizen' && <div className="w-2 h-2 rounded-full bg-primary-green" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Citizen</p>
                                    <p className="text-[10px] text-gray-400">Report waste & track local cleanliness</p>
                                </div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${role === 'admin' ? 'bg-primary-blue/20 border-primary-blue' : 'bg-black/20 border-white/10 hover:border-white/20'}`}>
                                <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'admin' ? 'border-primary-blue' : 'border-gray-500'}`}>
                                    {role === 'admin' && <div className="w-2 h-2 rounded-full bg-primary-blue" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Municipal Official</p>
                                    <p className="text-[10px] text-gray-400">Access Command Center & Dispatch Vans</p>
                                </div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${role === 'hospital' ? 'bg-warning-amber/20 border-warning-amber' : 'bg-black/20 border-white/10 hover:border-white/20'}`}>
                                <input type="radio" name="role" value="hospital" checked={role === 'hospital'} onChange={() => setRole('hospital')} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'hospital' ? 'border-warning-amber' : 'border-gray-500'}`}>
                                    {role === 'hospital' && <div className="w-2 h-2 rounded-full bg-warning-amber" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Hospital Official</p>
                                    <p className="text-[10px] text-gray-400">Manage Biomedical Waste & QR Trace</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {role === 'hospital' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Hospital Name</label>
                            <input
                                type="text"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-warning-amber/50 focus:border-transparent transition-all"
                                placeholder="e.g. Government Rajaji Hospital"
                                required={role === 'hospital'}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green/50 focus:border-transparent transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green/50 focus:border-transparent transition-all"
                            placeholder="citizen@madurai.gov.in"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green/50 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                        <MapPin className={`w-3.5 h-3.5 ${location ? 'text-primary-green' : 'text-gray-500 animate-pulse'}`} />
                        <span className={location ? 'text-gray-300' : 'text-gray-500'}>
                            {location ? `Linked to ${location.zone}` : "Detecting Madurai Zone..."}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-primary-green/90 hover:bg-primary-green text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400 relative z-10">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary-green hover:text-white transition-colors">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
