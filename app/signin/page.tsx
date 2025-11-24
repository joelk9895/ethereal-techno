"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// --- Animation Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

interface SignInFormData {
  email: string;
  password: string;
}

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [formData, setFormData] = useState<SignInFormData>({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (registered === "true") {
            setShowSuccess(true);
            // Optional: clear param to prevent showing again on refresh
            window.history.replaceState(null, '', '/signin');
        }
    }, [registered]);

    const getRedirectUrl = (userType: string) => {
        switch (userType) {
            case "ADMIN":
                return "/admin";
            case "ARTIST":
                return "/dashboard/producer";
            case "ARTIST_APPLICANT":
                // Check if they have a pending application
                return "/dashboard"; // They can view their application status
            case "USER":
            default:
                return "/dashboard";
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.error || "Invalid credentials" });
                setLoading(false);
                return;
            }

            // Store auth data
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Determine redirect URL based on user type
            const redirectUrl = getRedirectUrl(data.user.type);
            
            // Add a small delay to ensure localStorage is set
            setTimeout(() => {
                router.push(redirectUrl);
            }, 100);

        } catch (error) {
            console.error("Sign in error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black grid lg:grid-cols-2">

            {/* --- LEFT PANEL: Brand Atmosphere (Hidden on Mobile) --- */}
            <div className="hidden lg:flex relative flex-col justify-between p-12 bg-white/[0.02] border-r border-white/10 overflow-hidden">
                {/* Background Noise */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[150px]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Secure Access</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <h1 className="font-main text-8xl uppercase leading-[0.9] mb-6">
                        Ethereal<br />Techno
                    </h1>
                    <p className="text-xl text-white/50 font-light max-w-md leading-relaxed">
                        Log in to access your dashboard, manage content, and connect with the circle.
                    </p>
                </div>

                <div className="relative z-10 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    © 2025 Ethereal Techno // All Rights Reserved
                </div>
            </div>

            {/* --- RIGHT PANEL: Login Form --- */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative">

                {/* Mobile Home Link */}
                <Link href="/" className="absolute top-8 left-6 lg:left-12 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back Home
                </Link>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Mobile Header */}
                    <div className="lg:hidden mb-12 mt-12">
                        <h1 className="font-main text-5xl uppercase mb-2">Sign In</h1>
                        <p className="text-white/50">Welcome back to the circle.</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-12">
                        <h2 className="font-main text-4xl uppercase mb-2">Identify</h2>
                        <p className="text-white/50">Enter your credentials to continue.</p>
                    </div>

                    {/* Alerts */}
                    {showSuccess && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 border-l-2 border-green-500 bg-green-500/10 flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-green-400 uppercase tracking-wide">Success</p>
                                <p className="text-sm text-white/60">Account created. Please log in.</p>
                            </div>
                        </motion.div>
                    )}

                    {errors.general && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 border-l-2 border-red-500 bg-red-500/10 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-400 uppercase tracking-wide">Error</p>
                                <p className="text-sm text-white/60">{errors.general}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Email */}
                        <div className="group">
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">Email Address</label>
                                {errors.email && <span className="text-[10px] text-red-500 font-mono">{errors.email}</span>}
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`
                                    w-full bg-transparent border-b py-3 text-lg text-white placeholder:text-white/10 focus:outline-none transition-colors
                                    ${errors.email ? "border-red-500" : "border-white/20 focus:border-primary"}
                                `}
                                placeholder="name@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="group">
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">Password</label>
                                {errors.password && <span className="text-[10px] text-red-500 font-mono">{errors.password}</span>}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`
                                        w-full bg-transparent border-b py-3 text-lg text-white placeholder:text-white/10 focus:outline-none transition-colors pr-10
                                        ${errors.password ? "border-red-500" : "border-white/20 focus:border-primary"}
                                    `}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <Link href="/forgot-password" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-primary transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Footer Links */}
                        <div className="pt-8 border-t border-white/10 text-center">
                            <p className="text-sm text-white/40">
                                New to the circle?{" "}
                                <Link href="/signup" className="text-white hover:text-primary hover:underline transition-colors">
                                    Create Account
                                </Link>
                            </p>
                        </div>

                    </form>

                    {/* Admin Test Hint (Dev Only) */}
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-12 p-4 border border-dashed border-white/10 rounded text-xs font-mono text-white/30 space-y-2">
                            <span className="block uppercase tracking-widest text-white/20 mb-2">[ Dev Mode: Test Credentials ]</span>
                            <div className="text-left space-y-1">
                                <div><span className="text-white/20">Admin:</span> admin@etherealtechno.com / Admin123!</div>
                                <div><span className="text-white/20">Artist:</span> artist@etherealtechno.com / Artist123!</div>
                                <div><span className="text-white/20">User:</span> user@etherealtechno.com / User123!</div>
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono tracking-widest text-white/50">LOADING...</span>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}