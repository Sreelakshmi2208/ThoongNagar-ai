"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to create account");
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-primary-green/90 hover:bg-primary-green text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group glow-green disabled:opacity-50 disabled:cursor-not-allowed"
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
