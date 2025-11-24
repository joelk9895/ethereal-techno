"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Upload,
    Check,
    Disc,
    Mic2,
    Music
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion } from "framer-motion";

// --- Types ---
interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    surname: string;
    artistName: string;
    photo: File | null;
    photoPreview: string | null;
    instagram: string;
    tiktok: string;
    facebook: string;
    youtube: string;
    x: string;
    linktree: string;
    spotify: string;
    soundcloud: string;
    beatport: string;
    bandcamp: string;
    appleMusic: string;
    track1: string;
    track2: string;
    track3: string;
    quote: string;
    canCreateLoops: boolean;
    canCreateSerum: boolean;
    canCreateDiva: boolean;
    agreedToTerms: boolean;
}

interface MinimalInputProps {
    label: string;
    error?: string;
    prefix?: string;
    className?: string;
    disabled?: boolean;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

interface SectionHeaderProps {
    number: string;
    title: string;
}

interface CapabilityCheckboxProps {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ size?: number }>;
}

// --- Animation Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function ApplyPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkExistingApplication = useCallback(async () => {
        try {
            const response = await fetch("/api/artist/apply", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (!response.ok) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error checking application:", error);
            router.push("/dashboard");
        }
    }, [router]);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.type !== "USER") {
            router.push("/dashboard");
            return;
        }
        setIsAuthorized(true);
        checkExistingApplication();
        setLoading(false);
    }, [router, checkExistingApplication]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-24">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-24"
                >
                    <h1 className="font-main text-6xl md:text-8xl uppercase leading-[0.9] mb-6">
                        Join The<br /><span className="text-primary">Circle.</span>
                    </h1>
                    <p className="text-xl text-white/50 font-light max-w-xl leading-relaxed">
                        Apply to become a verified producer. Access exclusive resources, collaborate, and shape the future of Ethereal Techno.
                    </p>
                </motion.div>

                <form className="space-y-32">

                    {/* 01. ACCOUNT */}
                    {/* Note: The form sections are incomplete in the provided code, but the structure is preserved */}

                    {/* 02. IDENTITY */}
                    <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <SectionHeader number="01" title="Identity" />
                        <div className="space-y-12">

                            {/* Photo Upload - High Design */}
                            <div className="flex flex-col md:flex-row items-start gap-12">
                                <div className="group relative w-40 h-40 flex-shrink-0">
                                    <div className={`w-full h-full rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center transition-colors`}>
                                        <Upload className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
                                    </div>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-1 space-y-8 w-full">
                                    <div className="space-y-2">
                                        <h3 className="font-main text-2xl uppercase">Artist Avatar</h3>
                                        <p className="text-white/40 text-sm">Upload a high-res image. This will be your face in the circle.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <label className="text-xs font-mono text-white/40 uppercase mb-6 block">Social Presence</label>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <MinimalInput prefix="instagram.com/" label="Instagram" />
                                    <MinimalInput prefix="soundcloud.com/" label="SoundCloud" />
                                    <MinimalInput prefix="spotify.com/" label="Spotify URL" />
                                    <MinimalInput label="Linktree / Website" />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* 03. EVIDENCE */}
                    <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <SectionHeader number="02" title="Evidence" />
                        <div className="space-y-8">
                            <p className="text-white/50 text-lg font-light">
                                Provide links to your 3 best tracks. We are looking for depth, quality, and emotion.
                            </p>
                            <div className="grid gap-6">
                                {[1, 2, 3].map((num) => (
                                    <MinimalInput
                                        key={num}
                                        label={`Track Submission ${num}`}
                                        placeholder="https://soundcloud.com/..."
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* 04. MANIFESTO */}
                    <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <SectionHeader number="03" title="Manifesto" />
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <label className="font-main text-3xl uppercase text-white">Production Capabilities</label>
                                <p className="text-white/40 text-sm mb-4">What can you contribute to the vault?</p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <CapabilityCheckbox
                                        label="Audio Loops"
                                        active={false}
                                        onClick={() => {}}
                                        icon={Disc}
                                    />
                                    <CapabilityCheckbox
                                        label="Serum Presets"
                                        active={false}
                                        onClick={() => {}}
                                        icon={Mic2}
                                    />
                                    <CapabilityCheckbox
                                        label="DIVA Presets"
                                        active={false}
                                        onClick={() => {}}
                                        icon={Music}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="font-main text-3xl uppercase text-white">The Vision</label>
                                <div className="relative group">
                                    <textarea
                                        rows={4}
                                        className="w-full bg-transparent border-b border-white/20 py-4 text-xl md:text-3xl font-light text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/10 resize-none"
                                        placeholder='Complete the sentence: &ldquo;Ethereal Techno is...&rdquo;'
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* SUBMIT */}
                    <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className={`w-6 h-6 border border-white/20 flex items-center justify-center transition-colors bg-transparent group-hover:border-white`}>
                                <Check size={14} />
                            </div>
                            <input type="checkbox" className="hidden" />
                            <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                                I have read and agree to the Community Rules and Membership Policy.
                            </span>
                        </label>

                        <button
                            type="submit"
                            className="w-full py-6 bg-white text-black font-main text-2xl uppercase tracking-wide hover:bg-primary transition-colors"
                        >
                            Submit Application
                        </button>
                    </motion.section>

                </form>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

const MinimalInput: React.FC<MinimalInputProps> = ({ label, error, prefix, className = "", disabled = false, ...props }) => (
    <div className={`group relative w-full ${className}`}>
        <div className="flex items-end">
            {prefix && <span className="text-white/30 pb-4 pr-1 font-light select-none">{prefix}</span>}
            <input
                className={`
                    block w-full bg-transparent border-b py-4 text-white placeholder:text-white/10 
                    focus:outline-none transition-colors font-light text-lg
                    ${error ? "border-red-500" : "border-white/20 focus:border-primary"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                placeholder={label}
                disabled={disabled}
                {...props}
            />
        </div>
        <label className="absolute top-0 left-0 text-[10px] font-mono uppercase tracking-widest text-white/40 transition-all -translate-y-full mb-2">
            {label}
        </label>
        {error && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-mono">{error}</span>}
    </div>
);

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title }) => (
    <div className="flex items-baseline gap-4 mb-12 border-b border-white/10 pb-4">
        <span className="font-mono text-primary text-sm">/{number}</span>
        <h2 className="font-main text-4xl uppercase">{title}</h2>
    </div>
);

const CapabilityCheckbox: React.FC<CapabilityCheckboxProps> = ({ label, active, onClick, icon: Icon }) => (
    <div
        onClick={onClick}
        className={`
            cursor-pointer border p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300
            ${active ? "bg-white text-black border-white" : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white"}
        `}
    >
        <Icon size={24} />
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
);