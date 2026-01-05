
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Stethoscope, Activity, Loader2 } from "lucide-react";

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (isLogin) {
                const result = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (result?.error) {
                    setError("Invalid email or password");
                } else {
                    // Reload to update session
                    window.location.reload();
                }
            } else {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (res.ok) {
                    setIsLogin(true);
                    setError("Account created! Please log in.");
                } else {
                    setError("Failed to register. Email may be taken.");
                }
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-teal-600 p-8 text-center text-white">
                    <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Stethoscope size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">AIMed Guru</h1>
                    <p className="text-teal-100 flex items-center justify-center gap-1 mt-1 text-sm font-medium uppercase tracking-wider">
                        <Activity size={14} /> AI Medical Mentor
                    </p>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
                        {isLogin ? "Welcome Back" : "Join the Academy"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                required
                            />
                        </div>

                        {error && (
                            <p className={error.includes("created") ? "text-green-600 text-sm text-center" : "text-red-500 text-sm text-center"}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {isLogin ? "Log In" : "Sign Up"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                            }}
                            className="text-teal-600 font-semibold hover:underline"
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
