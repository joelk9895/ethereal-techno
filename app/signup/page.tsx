"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Min 8 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) setErrors({ email: "Email already registered" });
                else setErrors({ general: data.error || "Signup failed" });
                setLoading(false);
                return;
            }

            router.push("/signin?registered=true");
        } catch (error) {
            console.error("Signup error:", error);
            setErrors({ general: "Connection error. Please try again." });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black grid lg:grid-cols-2">

            {/* --- LEFT PANEL: Brand Atmosphere (Hidden on Mobile) --- */}
            <div className="hidden lg:flex relative flex-col justify-between p-12 bg-white/[0.02] border-r border-white/10 overflow-hidden">
                {/* Background Noise */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[150px]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 border border-white/20 rounded-full">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">New Member Registration</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <h1 className="font-main text-8xl uppercase leading-[0.9] mb-6">
                        Join The<br /><span className="text-primary">Movement</span>
                    </h1>
                    <p className="text-xl text-white/50 font-light max-w-md leading-relaxed">
                        Create an account to connect with the Ethereal Techno community.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <span>Est. 2025</span>
                    <div className="h-px w-8 bg-white/10" />
                    <span>Global Collective</span>
                </div>
            </div>

            {/* --- RIGHT PANEL: Signup Form --- */}
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
                        <h1 className="font-main text-5xl uppercase mb-2">Join Us</h1>
                        <p className="text-white/50">Create your account.</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-12">
                        <h2 className="font-main text-4xl uppercase mb-2">Initialize</h2>
                        <p className="text-white/50">Set up your access credentials.</p>
                    </div>

                    {/* General Error Alert */}
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

                        {/* Name */}
                        <div className="group">
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">Full Name</label>
                                {errors.name && <span className="text-[10px] text-red-500 font-mono">{errors.name}</span>}
                            </div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`
                                    w-full bg-transparent border-b py-3 text-lg text-white placeholder:text-white/10 focus:outline-none transition-colors
                                    ${errors.name ? "border-red-500" : "border-white/20 focus:border-primary"}
                                `}
                                placeholder="Your Name"
                            />
                        </div>

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
                                    placeholder="Min 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="group">
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">Confirm Password</label>
                                {errors.confirmPassword && <span className="text-[10px] text-red-500 font-mono">{errors.confirmPassword}</span>}
                            </div>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`
                                        w-full bg-transparent border-b py-3 text-lg text-white placeholder:text-white/10 focus:outline-none transition-colors pr-10
                                        ${errors.confirmPassword ? "border-red-500" : "border-white/20 focus:border-primary"}
                                    `}
                                    placeholder="Re-enter password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Footer Links */}
                        <div className="pt-8 border-t border-white/10 text-center">
                            <p className="text-sm text-white/40">
                                Already a member?{" "}
                                <Link href="/signin" className="text-white hover:text-primary hover:underline transition-colors">
                                    Sign In
                                </Link>
                            </p>
                            <p className="text-xs text-white/20 mt-8 max-w-xs mx-auto">
                                By joining, you agree to our <Link href="/terms" className="hover:text-white transition-colors">Terms</Link> and <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>.
                            </p>
                        </div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}