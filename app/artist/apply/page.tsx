"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Upload,
    Check,
    Disc,
    Mic2,
    Music,
    LayoutDashboard,
    User,
    FileText,
    ArrowUpRight,
    LogOut,
    LucideIcon,
    AlertCircle
} from "lucide-react";
import { getAuthUser, setAuthUser } from "@/lib/auth"; // Added setAuthUser
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface FormData {
    // Account (Guest only)
    name: string;
    surname: string;
    email: string;
    username: string;
    password: string;

    // Application
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

interface NavItemProps {
    id: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    onClick: () => void;
    external?: boolean;
}

// --- Animation Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function ApplyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null); // null = Guest
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        surname: "",
        email: "",
        username: "",
        password: "",
        artistName: "",
        photo: null,
        photoPreview: null,
        instagram: "",
        tiktok: "",
        facebook: "",
        youtube: "",
        x: "",
        linktree: "",
        spotify: "",
        soundcloud: "",
        beatport: "",
        bandcamp: "",
        appleMusic: "",
        track1: "",
        track2: "",
        track3: "",
        quote: "",
        canCreateLoops: false,
        canCreateSerum: false,
        canCreateDiva: false,
        agreedToTerms: false
    });

    const checkExistingApplication = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        // Only check if we have a token (logged in user)
        if (!token) return;

        try {
            const response = await fetch("/api/artist/apply", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.exists) {
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            console.error("Error checking application:", error);
        }
    }, [router]);

    useEffect(() => {
        const authUser = getAuthUser();
        // Allow access to guests (authUser is null) 
        // OR users of type USER.

        if (authUser) {
            if (authUser.type !== "USER") {
                router.push("/dashboard"); // Redirect producers/admins
                return;
            }
            setUser(authUser);
            // Pre-fill name if available
            setFormData(prev => ({ ...prev, name: authUser.name || "", email: authUser.email || "" }));
        }

        // If guest, we just stay here.

        checkExistingApplication();
        setLoading(false);
    }, [router, checkExistingApplication]);

    const handleNavigation = (id: string, external?: boolean) => {
        if (external) {
            if (id === "community") router.push("/community");
            if (id === "shop") router.push("/shop");
            return;
        }
        // If guest, prevent dashboard nav? Or let them go to login
        if (!user && (id === "overview" || id === "profile" || id === "applications")) {
            router.push("/signin");
            return;
        }

        if (id === "overview") router.push("/dashboard");
        if (id === "profile") router.push("/dashboard"); // Or add logic to open profile tab
        if (id === "applications") router.push("/dashboard");
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // File upload handler - basic implementation for now
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: file, photoPreview: reader.result as string }));
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitting(true);

        if (!formData.agreedToTerms) {
            setSubmitError("You must agree to the terms.");
            setSubmitting(false);
            return;
        }

        try {
            // Simplified payload - converting fields as needed
            const payload = {
                // Guest / Account fields
                ...(!user ? {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    name: formData.name,
                    surname: formData.surname,
                } : {}),

                // Application fields
                artistName: formData.artistName || (user ? user.username : formData.username), // Default to username if empty
                quote: formData.quote,
                // Photo uploading logic would normally go to a separate endpoint first to get a URL, 
                // skipping for this implementation as backend expects URL strings.
                photoUrl: null,
                instagram: formData.instagram,
                soundcloud: formData.soundcloud,
                spotify: formData.spotify,
                linktree: formData.linktree,
                track1: formData.track1,
                track2: formData.track2,
                track3: formData.track3,
                canCreateLoops: formData.canCreateLoops,
                canCreateSerum: formData.canCreateSerum,
                canCreateDiva: formData.canCreateDiva,
            };

            const token = localStorage.getItem("accessToken");
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch("/api/artist/apply", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setSubmitError(data.error || "Application failed.");
                return;
            }

            // Success!
            // If we got a token back (Guest flow), log them in
            if (data.token && data.user) {
                localStorage.setItem("accessToken", data.token);
                setAuthUser(data.user);
            }

            router.push("/dashboard");

        } catch (error) {
            setSubmitError("Something went wrong. Please try again.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-mono tracking-widest text-white/50">LOADING...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                {/* --- RIGHT SIDEBAR (Navigation) --- */}
                <aside className="hidden lg:flex w-80 h-full border-l border-white/10 bg-black/50 backdrop-blur-xl z-20 pt-24 pb-12 px-8 flex-col justify-between overflow-y-auto no-scrollbar">
                    {user ? (
                        <>
                            <div>
                                <div className="mb-12">
                                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">My Account</div>
                                    <h1 className="font-main text-3xl text-white uppercase leading-none break-words">
                                        {user.name}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-mono text-primary uppercase tracking-widest">@{user.username}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{user.type}</span>
                                    </div>
                                </div>

                                <nav className="space-y-1">
                                    <NavItem id="overview" label="Overview" icon={LayoutDashboard} active={false} onClick={() => handleNavigation("overview")} />
                                    <NavItem id="profile" label="Edit Profile" icon={User} active={false} onClick={() => handleNavigation("profile")} />
                                    <NavItem id="applications" label="Applications" icon={FileText} active={true} onClick={() => handleNavigation("applications")} />
                                </nav>
                            </div>
                        </>
                    ) : (
                        // Guest Sidebar Content
                        <div>
                            <div className="mb-12">
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Apply</div>
                                <h1 className="font-main text-3xl text-white uppercase leading-none break-words">
                                    Guest
                                </h1>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-none text-xs text-white/60 mb-8">
                                <p>You are applying as a guest. An account will be created for you automatically.</p>
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={() => router.push("/signin")}
                                    className="flex items-center gap-2 text-xs font-mono text-primary hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    Already have an account? Login
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mt-12">
                        {user && (
                            <button className="flex items-center gap-3 text-xs font-mono text-white/40 hover:text-red-400 transition-colors uppercase tracking-widest">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        )}
                        <div className="mt-8 space-y-1">
                            <NavItem id="community" label="Community Hub" icon={ArrowUpRight} active={false} onClick={() => handleNavigation("community", true)} external />
                            <NavItem id="shop" label="Browse Shop" icon={ArrowUpRight} active={false} onClick={() => handleNavigation("shop", true)} external />
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 lg:overflow-y-auto pt-24 px-6 lg:px-20 pb-24 relative no-scrollbar">

                    <div className="max-w-4xl mx-auto">
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

                        <form className="space-y-32" onSubmit={handleSubmit}>

                            {/* 00. ACCOUNT (Only for Guests) */}
                            {!user && (
                                <motion.section variants={fadeInUp} initial="hidden" animate="visible">
                                    <SectionHeader number="00" title="Account Setup" />
                                    <div className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <MinimalInput
                                                label="First Name"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                            />
                                            <MinimalInput
                                                label="Last Name"
                                                value={formData.surname}
                                                onChange={(e) => handleInputChange("surname", e.target.value)}
                                            />
                                        </div>
                                        <MinimalInput
                                            label="Email Address"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                        />
                                        <MinimalInput
                                            label="Username"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange("username", e.target.value)}
                                            prefix="@"
                                        />
                                        <MinimalInput
                                            label="Password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                        />
                                    </div>
                                </motion.section>
                            )}

                            {/* 01. IDENTITY */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                <SectionHeader number={!user ? "01" : "01"} title="Identity" />
                                <div className="space-y-12">

                                    {/* Artist Name */}
                                    <MinimalInput
                                        label="Artist / Stage Name"
                                        value={formData.artistName}
                                        onChange={(e) => handleInputChange("artistName", e.target.value)}
                                        placeholder={user ? user.username : ""}
                                    />

                                    {/* Photo Upload */}
                                    <div className="flex flex-col md:flex-row items-start gap-12 pt-8">
                                        <div className="group relative w-40 h-40 flex-shrink-0 cursor-pointer">
                                            <div className={`w-full h-full rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center transition-colors relative`}>
                                                {formData.photoPreview ? (
                                                    <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
                                                )}
                                            </div>
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="flex-1 space-y-2 pt-4">
                                            <h3 className="font-main text-2xl uppercase">Artist Avatar</h3>
                                            <p className="text-white/40 text-sm">Upload a high-res image. This will be your face in the circle.</p>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <label className="text-xs font-mono text-white/40 uppercase mb-6 block">Social Presence</label>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <MinimalInput
                                                prefix="instagram.com/"
                                                label="Instagram"
                                                value={formData.instagram}
                                                onChange={(e) => handleInputChange("instagram", e.target.value)}
                                            />
                                            <MinimalInput
                                                prefix="soundcloud.com/"
                                                label="SoundCloud"
                                                value={formData.soundcloud}
                                                onChange={(e) => handleInputChange("soundcloud", e.target.value)}
                                            />
                                            <MinimalInput
                                                prefix="spotify.com/"
                                                label="Spotify URL"
                                                value={formData.spotify}
                                                onChange={(e) => handleInputChange("spotify", e.target.value)}
                                            />
                                            <MinimalInput
                                                label="Linktree / Website"
                                                value={formData.linktree}
                                                onChange={(e) => handleInputChange("linktree", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 02. EVIDENCE */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                                <SectionHeader number={!user ? "02" : "02"} title="Evidence" />
                                <div className="space-y-8">
                                    <p className="text-white/50 text-lg font-light">
                                        Provide links to your 3 best tracks. We are looking for depth, quality, and emotion.
                                    </p>
                                    <div className="grid gap-6">
                                        <MinimalInput label="Track Submission 1" placeholder="https://soundcloud.com/..." value={formData.track1} onChange={(e) => handleInputChange("track1", e.target.value)} />
                                        <MinimalInput label="Track Submission 2" placeholder="https://soundcloud.com/..." value={formData.track2} onChange={(e) => handleInputChange("track2", e.target.value)} />
                                        <MinimalInput label="Track Submission 3" placeholder="https://soundcloud.com/..." value={formData.track3} onChange={(e) => handleInputChange("track3", e.target.value)} />
                                    </div>
                                </div>
                            </motion.section>

                            {/* 03. MANIFESTO */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                                <SectionHeader number={!user ? "03" : "03"} title="Manifesto" />
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <label className="font-main text-3xl uppercase text-white">Production Capabilities</label>
                                        <p className="text-white/40 text-sm mb-4">What can you contribute to the vault?</p>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <CapabilityCheckbox
                                                label="Audio Loops"
                                                active={formData.canCreateLoops}
                                                onClick={() => handleInputChange("canCreateLoops", !formData.canCreateLoops)}
                                                icon={Disc}
                                            />
                                            <CapabilityCheckbox
                                                label="Serum Presets"
                                                active={formData.canCreateSerum}
                                                onClick={() => handleInputChange("canCreateSerum", !formData.canCreateSerum)}
                                                icon={Mic2}
                                            />
                                            <CapabilityCheckbox
                                                label="DIVA Presets"
                                                active={formData.canCreateDiva}
                                                onClick={() => handleInputChange("canCreateDiva", !formData.canCreateDiva)}
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
                                                value={formData.quote}
                                                onChange={(e) => handleInputChange("quote", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Error Message */}
                            {submitError && (
                                <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-200 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm font-mono">{submitError}</span>
                                </div>
                            )}

                            {/* SUBMIT */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="space-y-8">
                                <div
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => handleInputChange("agreedToTerms", !formData.agreedToTerms)}
                                >
                                    <div className={`w-6 h-6 border border-white/20 flex items-center justify-center transition-colors bg-transparent group-hover:border-white ${formData.agreedToTerms ? "bg-primary text-black border-primary" : ""}`}>
                                        {formData.agreedToTerms && <Check size={14} />}
                                    </div>
                                    <span className="text-sm text-white/60 group-hover:text-white transition-colors select-none">
                                        I have read and agree to the Community Rules and Membership Policy.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !formData.agreedToTerms}
                                    className="w-full py-6 bg-white text-black font-main text-2xl uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Submitting..." : "Submit Application"}
                                </button>
                            </motion.section>

                        </form>
                    </div>
                </main>
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

const NavItem: React.FC<NavItemProps> = ({ id, label, icon: Icon, active, onClick, external }) => (
    <button
        onClick={onClick}
        className={`
            group w-full flex items-center justify-between py-4 px-4 rounded-none border-l-2 transition-all duration-300
            ${active
                ? "border-primary bg-white/[0.03]"
                : "border-transparent hover:border-white/20 hover:bg-white/[0.02]"
            }
        `}
    >
        <div className="flex items-center gap-4">
            <Icon className={`w-4 h-4 transition-colors ${active ? "text-primary" : "text-white/30 group-hover:text-white/60"}`} />
            <span className={`text-sm font-medium uppercase tracking-wider transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                {label}
            </span>
        </div>
        {external && <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-primary" />}
    </button>
);