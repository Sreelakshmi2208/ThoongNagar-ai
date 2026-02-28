"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (email !== "admin@thoonganagaram.ai") {
            setError("Access Restricted. Only Authorized Command Center accounts permitted.");
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err: any) {
            setError(err.message || "Failed to authenticate Admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 relative overflow-hidden border-risk-red/30">
                {/* Glow effect background specifically styled for admin */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-risk-red/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-blue/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4 border border-risk-red/50 shadow-[0_0_15px_rgba(213,0,0,0.5)]">
                        <ShieldCheck className="text-risk-red w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
                    <p className="text-risk-red text-sm mt-2 text-center font-medium">
                        Restricted Admin Access Only
                    </p>
                </div>

                {error && (
                    <div className="bg-risk-red/20 border border-risk-red text-white text-sm px-4 py-2 rounded-lg mb-4 relative z-10 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="relative z-10 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-risk-red/50 focus:border-transparent transition-all"
                            placeholder="admin@thoonganagaram.ai"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Passkey</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-risk-red/50 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-risk-red/90 hover:bg-risk-red text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(213,0,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                        {loading ? "Authenticating..." : "Authorize Access"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
}
