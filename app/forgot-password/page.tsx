"use client";

import { Suspense, useState, useRef, useEffect } from "react";

import { Eye, EyeOff, Loader2, Check, AlertCircle, ArrowLeft, Mail, KeyRound } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Animation Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

function ForgotPasswordContent() {

    const [step, setStep] = useState<"email" | "reset" | "success">("email");
    
    // Form State
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // OTP State
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        if (resendCooldown > 0) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch("/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.error || "Failed to send code" });
                setLoading(false);
                return;
            }

            setStep("reset");
            setResendCooldown(60);
            setLoading(false);
            
            // Focus first OTP input when step changes
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);

        } catch (error) {
            console.error("Send OTP error:", error);
            setErrors({ general: "Connection error. Please try again." });
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const fullOtp = otpDigits.join("");
        if (fullOtp.length !== 6) {
            setErrors({ otp: "Please enter the complete 6-digit code" });
            return;
        }

        if (newPassword.length < 8) {
            setErrors({ password: "Password must be at least 8 characters" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: fullOtp, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.error || "Failed to reset password" });
                setLoading(false);
                return;
            }

            setStep("success");
            setLoading(false);

        } catch (error) {
            console.error("Reset password error:", error);
            setErrors({ general: "Connection error. Please try again." });
            setLoading(false);
        }
    };

    // --- OTP Handlers ---
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);
        setErrors(e => ({ ...e, otp: "", general: "" }));

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 0) return;

        const newDigits = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setOtpDigits(newDigits);
        setErrors(e => ({ ...e, otp: "", general: "" }));

        if (pasted.length < 6) {
            inputRefs.current[pasted.length]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black grid lg:grid-cols-2">

            {/* Left Graphic Panel */}
            <div className="hidden lg:flex relative flex-col justify-center p-12 bg-black border-r border-white/10 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-tertiary/5 rounded-full blur-[150px]" />

                <div className="relative z-10">
                    <h1 className="font-main text-8xl uppercase leading-[0.9] mb-6">
                        Lost<br />Access
                    </h1>
                    <p className="text-xl text-white/50 font-light max-w-md leading-relaxed">
                        Reset your password to regain entry to your dashboard and the Ethereal Techno circle.
                    </p>
                </div>
            </div>

            {/* Right Logic Panel */}
            <div className="flex flex-col bg-background justify-center px-6 sm:px-12 lg:px-24 py-12 relative overflow-y-auto min-h-screen lg:min-h-0">

                <Link href="/signin" className="absolute top-8 left-6 lg:left-12 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors z-20">
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>

                <div className="relative w-full max-w-md mx-auto py-12">
                    <AnimatePresence mode="wait">
                        {step === "email" && (
                            <motion.div
                                key="email"
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: -20 }}
                                variants={fadeInUp}
                            >
                                <div className="lg:hidden mb-12 mt-12">
                                    <h1 className="font-main text-5xl uppercase mb-2">Recovery</h1>
                                    <p className="text-white/50">Reset your credentials.</p>
                                </div>

                                <div className="hidden lg:block mb-12">
                                    <h2 className="font-main text-4xl uppercase mb-2">Recovery</h2>
                                    <p className="text-white/50">Enter your email to receive a reset code.</p>
                                </div>

                                {errors.general && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 border-l-2 border-red-500 bg-red-500/10 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-red-400 uppercase tracking-wide">Error</p>
                                            <p className="text-sm text-white/60">{errors.general}</p>
                                        </div>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-sans uppercase tracking-widest text-white/40 font-medium group-focus-within:text-white/80 transition-colors">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-white/60 transition-colors">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                autoFocus
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setErrors(err => ({ ...err, email: "" }));
                                                }}
                                                className={`w-full bg-[#121212] border ${errors.email ? 'border-red-500/50' : 'border-white/5'} p-4 pl-12 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-colors`}
                                                placeholder="producer@studio.com"
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-400 pt-1">{errors.email}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-white text-black font-sans text-sm font-bold rounded-xl uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[54px] disabled:hover:bg-white"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === "reset" && (
                            <motion.div
                                key="reset"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="mb-10">
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-white/50">
                                        <KeyRound size={20} />
                                    </div>
                                    <h2 className="font-main text-4xl uppercase mb-2">New Password</h2>
                                    <p className="text-white/50 text-sm">
                                        Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span> and choose a new password.
                                    </p>
                                </div>

                                {errors.general && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 border-l-2 border-red-500 bg-red-500/10 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-red-400 uppercase tracking-wide">Error</p>
                                            <p className="text-sm text-white/60">{errors.general}</p>
                                        </div>
                                    </motion.div>
                                )}

                                <form onSubmit={handleReset} className="space-y-8">
                                    {/* OTP Input Section */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-sans uppercase tracking-widest text-white/40 font-medium">
                                            Verification Code
                                        </label>
                                        <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                                            {otpDigits.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={el => { inputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className={`w-12 h-14 bg-[#121212] border ${errors.otp ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-white/30'} rounded-xl text-center text-xl font-mono focus:outline-none transition-all focus:bg-white/5`}
                                                />
                                            ))}
                                        </div>
                                        {errors.otp && <p className="text-xs text-red-400 pt-1">{errors.otp}</p>}
                                        
                                        <div className="flex justify-start">
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={resendCooldown > 0 || loading}
                                                className="text-[11px] font-mono tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-white/40"
                                            >
                                                {resendCooldown > 0
                                                    ? `Resend available in ${resendCooldown}s`
                                                    : "Didn't receive code? Resend"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full h-[1px] bg-white/5" />

                                    {/* Passwords Section */}
                                    <div className="space-y-6">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-sans uppercase tracking-widest text-white/40 font-medium group-focus-within:text-white/80 transition-colors">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => {
                                                        setNewPassword(e.target.value);
                                                        setErrors(err => ({ ...err, password: "" }));
                                                    }}
                                                    className={`w-full bg-[#121212] border ${errors.password ? 'border-red-500/50' : 'border-white/5'} p-4 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-colors font-mono tracking-wider`}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/60 transition-colors"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-xs text-red-400 pt-1">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-sans uppercase tracking-widest text-white/40 font-medium group-focus-within:text-white/80 transition-colors">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => {
                                                        setConfirmPassword(e.target.value);
                                                        setErrors(err => ({ ...err, confirmPassword: "" }));
                                                    }}
                                                    className={`w-full bg-[#121212] border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/5'} p-4 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-colors font-mono tracking-wider`}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                            {errors.confirmPassword && <p className="text-xs text-red-400 pt-1">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otpDigits.some(d => !d)}
                                        className="w-full py-4 bg-white text-black font-sans text-sm font-bold rounded-xl uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[54px] disabled:hover:bg-white"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="text-center py-12"
                            >
                                <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Check className="w-10 h-10 text-green-400" />
                                </div>
                                <h2 className="font-main text-4xl uppercase mb-4 text-white">Password Reset</h2>
                                <p className="text-white/50 mb-12 max-w-sm mx-auto">
                                    Your password has been successfully updated. You can now log in with your new credentials.
                                </p>
                                
                                <Link 
                                    href="/signin"
                                    onClick={() => {
                                        // Slight delay ensures the button animation plays out before navigation
                                    }}
                                    className="w-full py-4 bg-white text-black font-sans text-sm font-bold rounded-xl uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98] flex items-center justify-center h-[54px]"
                                >
                                    Log In Now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex place-items-center"><Loader2 className="w-8 h-8 animate-spin text-white/20" /></div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
