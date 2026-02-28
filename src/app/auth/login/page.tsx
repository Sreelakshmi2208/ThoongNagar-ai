"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, ShieldCheck, User as UserIcon } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
    const [loginType, setLoginType] = useState<"citizen" | "admin">("citizen");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (loginType === "admin") {
            if (email === "Sree" && password === "Sree@123") {
                router.push("/admin");
            } else {
                setError("Access Restricted. Invalid admin credentials.");
                setLoading(false);
            }
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to log in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className={`glass-card w-full max-w-md p-8 relative overflow-hidden transition-colors ${loginType === 'admin' ? 'border-risk-red/30' : ''}`}>
                {/* Glow effect background */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${loginType === 'admin' ? 'bg-risk-red/10' : 'bg-primary-blue/20'}`} />
                <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${loginType === 'admin' ? 'bg-primary-blue/10' : 'bg-primary-green/20'}`} />

                <div className="relative z-10 flex flex-col items-center mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all ${loginType === 'admin' ? 'bg-black border border-risk-red/50 shadow-[0_0_15px_rgba(213,0,0,0.5)] text-risk-red' : 'bg-primary-blue/20 glow-blue text-primary-blue'}`}>
                        {loginType === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {loginType === 'admin' ? 'Command Center' : 'Welcome Back'}
                    </h1>
                    <p className={`text-sm mt-2 text-center font-medium ${loginType === 'admin' ? 'text-risk-red' : 'text-gray-400'}`}>
                        {loginType === 'admin' ? 'Restricted Admin Access Only' : 'Log in to the ThoongaNagaram AI'}
                    </p>
                </div>

                <div className="relative z-10 flex bg-black/40 rounded-lg p-1 border border-white/5 mb-6">
                    <button
                        type="button"
                        onClick={() => { setLoginType("citizen"); setError(""); setEmail(""); setPassword(""); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${loginType === 'citizen' ? 'bg-primary-blue/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <UserIcon className="w-4 h-4" /> Citizen
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginType("admin"); setError(""); setEmail(""); setPassword(""); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${loginType === 'admin' ? 'bg-risk-red/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Admin
                    </button>
                </div>

                {error && (
                    <div className="bg-risk-red/20 border border-risk-red text-white text-sm px-4 py-2 rounded-lg mb-4 relative z-10 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="relative z-10 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {loginType === 'admin' ? 'Username' : 'Email'}
                        </label>
                        <input
                            type={loginType === 'admin' ? 'text' : 'email'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${loginType === 'admin' ? 'focus:ring-risk-red/50 bg-black/40' : 'focus:ring-primary-blue/50'}`}
                            placeholder={loginType === 'admin' ? 'Sree' : 'citizen@madurai.gov.in'}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${loginType === 'admin' ? 'focus:ring-risk-red/50 bg-black/40' : 'focus:ring-primary-blue/50'}`}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-8 font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${loginType === 'admin' ? 'bg-risk-red/90 hover:bg-risk-red text-white shadow-[0_0_15px_rgba(213,0,0,0.5)] uppercase tracking-wider font-bold text-sm' : 'bg-primary-blue/90 hover:bg-primary-blue text-white glow-blue'}`}
                    >
                        {loading ? "Authenticating..." : (loginType === 'admin' ? "Authorize Access" : "Sign In")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400 relative z-10">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className={`${loginType === 'admin' ? 'text-risk-red' : 'text-primary-blue'} hover:text-white transition-colors`}>
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}

