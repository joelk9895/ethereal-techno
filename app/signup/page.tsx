"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function SignUpPage() {
    const router = useRouter();
    const [step, setStep] = useState<"form" | "otp">("form");
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // OTP state
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const countries = [
        "United States", "United Kingdom", "Canada", "Australia", "Germany",
        "France", "Spain", "Italy", "Netherlands", "Belgium", "Sweden",
        "Norway", "Denmark", "Finland", "Switzerland", "Austria", "Portugal",
        "Ireland", "Poland", "Czech Republic", "Greece", "Romania", "Hungary",
        "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru",
        "Japan", "South Korea", "China", "India", "Singapore", "Thailand",
        "South Africa", "Egypt", "Nigeria", "Kenya", "Morocco",
        "New Zealand", "Russia", "Ukraine", "Turkey", "Israel",
        "United Arab Emirates", "Saudi Arabia", "Qatar", "Other"
    ].sort();

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "First Name is required";
        if (!formData.surname.trim()) newErrors.surname = "Last Name is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Min 8 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setErrors({});

        try {
            // Check if email already exists first
            const checkRes = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    country: formData.country,
                    email: formData.email,
                    password: formData.password,
                    otp: "check-only", // Will fail OTP but we can catch 409 before sending OTP
                }),
            });

            if (checkRes.status === 409) {
                setErrors({ email: "Email already registered" });
                setLoading(false);
                return;
            }

            // Send OTP
            const otpRes = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                }),
            });

            const otpData = await otpRes.json();

            if (!otpRes.ok) {
                setErrors({ general: otpData.error || "Failed to send verification code" });
                setLoading(false);
                return;
            }

            setStep("otp");
            setResendCooldown(60);
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");
        } catch (error) {
            console.error("Send OTP error:", error);
            setErrors({ general: "Connection error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);
        setOtpError("");

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits filled
        const fullOtp = newDigits.join("");
        if (fullOtp.length === 6) {
            handleVerifyOtp(fullOtp);
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
        setOtpError("");

        if (pasted.length === 6) {
            handleVerifyOtp(pasted);
        } else {
            inputRefs.current[pasted.length]?.focus();
        }
    };

    // Step 2: Verify OTP + complete signup
    const handleVerifyOtp = async (otp: string) => {
        setOtpLoading(true);
        setOtpError("");

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    country: formData.country,
                    email: formData.email,
                    password: formData.password,
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setOtpError(data.error || "Verification failed");
                setOtpDigits(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                setOtpLoading(false);
                return;
            }

            router.push("/signin?registered=true");
        } catch (error) {
            console.error("Verify OTP error:", error);
            setOtpError("Connection error. Please try again.");
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setOtpLoading(true);
        setOtpError("");

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setOtpError(data.error || "Failed to resend code");
            } else {
                setResendCooldown(60);
                setOtpDigits(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch {
            setOtpError("Connection error");
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black grid lg:grid-cols-2">

            <div className="hidden lg:flex relative flex-col justify-between p-12 bg-black border-r border-white/10 overflow-hidden">
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

            {/* --- RIGHT PANEL --- */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative">

                {/* Back Link */}
                <Link href="/" className="absolute top-8 left-6 lg:left-12 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back Home
                </Link>

                <AnimatePresence mode="wait">
                    {step === "form" ? (
                        <motion.div
                            key="form"
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
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
                            <form onSubmit={handleSendOtp} className="space-y-8">

                                {/* Name */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">First Name</label>
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
                                            placeholder="First Name"
                                        />
                                    </div>

                                    <div className="group">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">Last Name</label>
                                            {errors.surname && <span className="text-[10px] text-red-500 font-mono">{errors.surname}</span>}
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.surname}
                                            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                            className={`
                                                w-full bg-transparent border-b py-3 text-lg text-white placeholder:text-white/10 focus:outline-none transition-colors
                                                ${errors.surname ? "border-red-500" : "border-white/20 focus:border-primary"}
                                            `}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="group">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">Country</label>
                                        {errors.country && <span className="text-[10px] text-red-500 font-mono">{errors.country}</span>}
                                    </div>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className={`
                                            w-full bg-transparent border-b py-3 text-lg text-white focus:outline-none transition-colors appearance-none cursor-pointer
                                            ${errors.country ? "border-red-500" : "border-white/20 focus:border-primary"}
                                            ${!formData.country ? "text-white/30" : "text-white"}
                                        `}
                                    >
                                        <option value="" disabled className="bg-black text-white/30">Select your country</option>
                                        {countries.map(c => (
                                            <option key={c} value={c} className="bg-black text-white">{c}</option>
                                        ))}
                                    </select>
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

                                {/* Submit → Send Code */}
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
                                                <span>Send Verification Code</span>
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
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-md mx-auto"
                        >
                            {/* Back to form */}
                            <button
                                onClick={() => { setStep("form"); setOtpError(""); setOtpDigits(["", "", "", "", "", ""]); }}
                                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-12 mt-12 lg:mt-0"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back
                            </button>

                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/10 mb-6">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="font-main text-4xl uppercase mb-3">Verify Email</h2>
                                <p className="text-white/50 text-sm">
                                    We sent a 6-digit code to<br />
                                    <span className="text-white font-medium">{formData.email}</span>
                                </p>
                            </div>

                            {/* OTP Error */}
                            {otpError && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 border-l-2 border-red-500 bg-red-500/10 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                    <p className="text-sm text-red-400">{otpError}</p>
                                </motion.div>
                            )}

                            {/* OTP Input Boxes */}
                            <div className="flex justify-center gap-3 mb-10">
                                {otpDigits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onPaste={i === 0 ? handleOtpPaste : undefined}
                                        disabled={otpLoading}
                                        className={`
                                            w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-bold bg-transparent
                                            border-b-2 focus:outline-none transition-all
                                            ${digit ? "border-primary text-primary" : "border-white/20 text-white focus:border-white/50"}
                                            ${otpLoading ? "opacity-50 cursor-not-allowed" : ""}
                                        `}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            {/* Loading indicator */}
                            {otpLoading && (
                                <div className="flex items-center justify-center gap-3 mb-8">
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                    <span className="text-sm text-white/60">Verifying...</span>
                                </div>
                            )}

                            {/* Resend */}
                            <div className="text-center">
                                <p className="text-sm text-white/40 mb-2">Didn&apos;t receive the code?</p>
                                {resendCooldown > 0 ? (
                                    <p className="text-sm text-white/30">
                                        Resend in <span className="text-white font-mono">{resendCooldown}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={otpLoading}
                                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}