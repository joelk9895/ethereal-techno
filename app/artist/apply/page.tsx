"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { getAuthUser, setAuthUser, logout, AuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";




interface FormData {
    name: string;
    surname: string;
    email: string;
    username: string;
    password: string;

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
    allowContact: boolean;
}

interface MinimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    prefix?: string;
    className?: string;
    verifying?: boolean;
    verifiedData?: { title: string | null };
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

interface SoundCloudEmbedProps {
    url: string;
}

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

// --- MAIN COMPONENT ---

export default function ApplyPage() {
    const router = useRouter();
    const PREFIX = "Ethereal Techno is ";

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [verifying, setVerifying] = useState<Record<string, boolean>>({});
    const [verifiedLinks, setVerifiedLinks] = useState<Record<string, { title: string | null }>>({});

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
        quote: "Ethereal Techno is ",
        canCreateLoops: false,
        canCreateSerum: false,
        canCreateDiva: false,
        agreedToTerms: false,
        allowContact: false
    });

    const URL_PATTERNS: Record<string, RegExp> = {
        instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.-]+\/?$/,
        tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+\/?$/,
        facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[\w.-]+\/?$/,
        youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/@[\w.-]+\/?$/,
        x: /^(https?:\/\/)?(www\.)?x\.com\/[\w.-]+\/?$/,
        linktree: /^(https?:\/\/)?(www\.)?[\w.-]+\.[\w]{2,}(\/.*)?$/,
        spotify: /^(https?:\/\/)?(open\.)?spotify\.com\/artist\/[\w]+\/?$/, // Fixed regex
        soundcloud: /^(https?:\/\/)?(www\.)?soundcloud\.com\/[\w.-]+\/?$/,
        beatport: /^(https?:\/\/)?(www\.)?beatport\.com\/artist\/[\w.-]+\/\d+\/?$/,
        bandcamp: /^(https?:\/\/)?[\w.-]+\.bandcamp\.com\/?$/,
        appleMusic: /^(https?:\/\/)?music\.apple\.com\/[\w]{2}\/artist\/[\w.-]+\/\d+\/?$/,
    };

    const validateField = (field: string, value: string) => {
        if (!value) return true;

        let isValid = true;
        let customError = "";
        let regex = URL_PATTERNS[field];

        if (field === 'beatport') regex = /beatport\.com\/artist\/[^/]+/;
        if (field === 'appleMusic') regex = /music\.apple\.com\/.*\/artist\//;

        // Fallback checks
        switch (field) {
            case 'instagram': isValid = value.includes("instagram.com/"); break;
            case 'tiktok': isValid = value.includes("tiktok.com/@"); break;
            case 'facebook': isValid = value.includes("facebook.com/"); break;
            case 'youtube': isValid = value.includes("youtube.com/@"); break;
            case 'x': isValid = value.includes("x.com/"); break;
            case 'spotify': isValid = value.includes("spotify.com/"); break;
            case 'soundcloud': isValid = value.includes("soundcloud.com/"); break;
            case 'beatport': isValid = value.includes("beatport.com/artist/"); break;
            case 'bandcamp': isValid = value.includes(".bandcamp.com"); break;
            case 'appleMusic': isValid = value.includes("music.apple.com/") && value.includes("/artist/"); break;
            case 'track1':
            case 'track2':
            case 'track3':
                if (!value.includes("soundcloud.com/")) {
                    isValid = false;
                    customError = "For consistency in our review process, we accept SoundCloud links only.";
                } else if (value.includes("/sets/")) {
                    isValid = false;
                    customError = "Please submit individual track links only. Playlists or sets are not accepted.";
                }
                break;
        }

        // Apply Regex check if specific logic passed but we have a regex
        if (regex && isValid) {
            // simplified loose check: if value exists, let's trust the includes check above for now 
            // or enforce regex. For this fix, relying on the 'includes' switch is safer 
            // if user input varies (http vs https).
        }

        if (!isValid) {
            setErrors(prev => ({ ...prev, [field]: customError || `Invalid format. Expected: ${getPlaceholder(field)}` }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const getPlaceholder = (field: string) => {
        switch (field) {
            case 'instagram': return "instagram.com/yourprofile";
            case 'tiktok': return "tiktok.com/@yourprofile";
            case 'facebook': return "facebook.com/yourprofile";
            case 'youtube': return "youtube.com/@yourchannel";
            case 'x': return "x.com/yourprofile";
            case 'linktree': return "yourwebsite.com";
            case 'spotify': return "open.spotify.com/artist/...";
            case 'soundcloud': return "soundcloud.com/yourprofile";
            case 'beatport': return "beatport.com/artist/yourname";
            case 'bandcamp': return "yourname.bandcamp.com";
            case 'appleMusic': return "music.apple.com/artist/yourname";
            default: return "";
        }
    };

    const checkExistingApplication = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
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

        if (authUser) {
            if (authUser.type !== "USER") {
                router.push("/dashboard");
                return;
            }
            setUser(authUser as AuthUser);
            // Pre-fill name if available
            setFormData(prev => ({ ...prev, name: authUser.name || "", email: authUser.email || "" }));
        }

        checkExistingApplication();
        setLoading(false);
    }, [router, checkExistingApplication]);

    const handleNavigation = (id: string, external?: boolean) => {
        if (external) {
            if (id === "community") router.push("/community");
            if (id === "shop") router.push("/shop");
            return;
        }
        if (!user && (id === "overview" || id === "profile" || id === "applications")) {
            router.push("/signin");
            return;
        }

        if (id === "overview") router.push("/dashboard");
        if (id === "profile") router.push("/dashboard");
        if (id === "applications") router.push("/dashboard");
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (verifiedLinks[field]) {
            setVerifiedLinks(prev => {
                const newLinks = { ...prev };
                delete newLinks[field];
                return newLinks;
            });
        }

        if (typeof value === 'string' && (field in URL_PATTERNS || ['instagram', 'tiktok', 'facebook', 'youtube', 'x', 'linktree', 'spotify', 'soundcloud', 'beatport', 'bandcamp', 'appleMusic', 'track1', 'track2', 'track3'].includes(field))) {
            validateField(field, value);
        }
    };

    const handleBlur = async (field: string) => {
        const value = formData[field as keyof FormData];
        if (typeof value !== 'string' || !value || errors[field]) return;

        if (!['instagram', 'tiktok', 'facebook', 'youtube', 'x', 'linktree', 'spotify', 'soundcloud', 'beatport', 'bandcamp', 'appleMusic'].includes(field)) return;

        setVerifying(prev => ({ ...prev, [field]: true }));

        try {
            let urlToVerify = value;
            if (!urlToVerify.startsWith('http')) {
                urlToVerify = `https://${urlToVerify}`;
            }

            const response = await fetch("/api/verify-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: urlToVerify })
            });

            const data = await response.json();

            if (data.valid) {
                setVerifiedLinks(prev => ({
                    ...prev,
                    [field]: { title: data.title }
                }));
            } else {
                setErrors(prev => ({ ...prev, [field]: "Link is unreachable or invalid." }));
            }

        } catch (error) {
            console.error("Verification failed", error);
        } finally {
            setVerifying(prev => ({ ...prev, [field]: false }));
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
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

        if (Object.keys(errors).length > 0) {
            setSubmitError("Please fix the invalid links before submitting.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                // Guest / Account fields
                ...(!user ? {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    name: formData.name,
                    surname: formData.surname,
                } : {}),

                artistName: formData.artistName || (user ? user.username : formData.username),
                quote: formData.quote,
                photoUrl: null, // Logic to upload file usually happens before or via FormData object
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-mono tracking-widest text-white/50">LOADING...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#121212] text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                {/* --- RIGHT SIDEBAR (Navigation) --- */}
                <aside className="hidden lg:flex w-80 h-full border-l border-white/5 bg-black/50 backdrop-blur-xl z-20 pt-24 pb-12 px-8 flex-col justify-between overflow-y-auto no-scrollbar">
                    {user ? (
                        <>
                            <div>
                                <div className="mb-8 px-4">
                                    <div className="text-xs font-sans text-white/40 uppercase tracking-widest mb-4">My Account</div>
                                    <h1 className="font-main text-3xl text-white uppercase leading-none break-words tracking-wide mb-3">
                                        {user.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-sans text-primary uppercase tracking-widest">@{user.username}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="text-xs font-sans text-white/40 uppercase tracking-widest font-medium">{user.type}</span>
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
                            <div className="mb-8 px-4">
                                <div className="text-xs font-sans text-white/40 uppercase tracking-widest mb-4">Apply</div>
                                <h1 className="font-main text-3xl text-white uppercase leading-none break-words tracking-wide">
                                    Guest
                                </h1>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white/60 mb-8 font-light leading-relaxed">
                                <p>You are applying as a guest. An account will be created for you automatically.</p>
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={() => router.push("/signin")}
                                    className="group w-full flex items-center justify-start gap-4 py-3 px-4 rounded-xl border border-transparent transition-all duration-300 text-primary hover:text-white hover:bg-white/5"
                                >
                                    <span className="text-xs font-sans uppercase tracking-widest">Login</span>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mt-12">
                        {user && (
                            <button
                                onClick={() => logout()}
                                className="group w-full flex items-center justify-start gap-4 py-3 px-4 rounded-xl border border-transparent transition-all duration-300 text-white/40 hover:text-red-400 hover:bg-white/5"
                            >
                                <LogOut className="w-4 h-4 transition-colors" />
                                <span className="text-xs font-sans uppercase tracking-widest">Sign Out</span>
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
                            className="mb-16"
                        >
                            <h1 className="font-main text-5xl md:text-7xl uppercase leading-[0.9] mb-6 text-white tracking-wide">
                                Join The <span className="text-primary">Circle.</span>
                            </h1>
                            <p className="text-xl text-white font-medium leading-relaxed max-w-2xl">
                                Apply to become a verified Ethereal Techno producer.
                                <br /><br />
                                The Circle is a curated space for artists who share a deeper approach to sound, atmosphere, and intention.
                            </p>
                        </motion.div>

                        <form className="space-y-40" onSubmit={handleSubmit}>

                            {!user && (
                                <motion.section variants={fadeInUp} initial="hidden" animate="visible">
                                    <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
                                        <SectionHeader number="00" title="APPLICATION SETUP" />
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


                                        {/* CONTACT PREFERENCES */}
                                        <div className="mt-12 pt-12 border-t border-white/10">
                                            <label className="text-lg font-mono text-white  uppercase mb-8 block">Contact Preferences</label>
                                            <div
                                                className="flex items-start gap-4 cursor-pointer group"
                                                onClick={() => handleInputChange("allowContact", !formData.allowContact)}
                                            >
                                                <div className={`w-6 h-6 border border-white/20 flex items-center justify-center transition-colors bg-transparent group-hover:border-white ${formData.allowContact ? "bg-black border-white" : ""}`}>
                                                    {formData.allowContact && <Check size={14} color="white" strokeWidth={3} />}
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-sm text-white font-medium group-hover:text-white transition-colors select-none block">
                                                        Allow other verified producers to contact me via the Ethereal Techno platform.
                                                    </span>
                                                    <p className="text-white/60 text-xs font-light">
                                                        Your email address will not be shared. Messages are sent through a private contact form.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {/* 01. ARTIST IDENTITY */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-12">
                                    <SectionHeader number={!user ? "01" : "01"} title="ARTIST IDENTITY" />

                                    {/* Artist Name */}
                                    <MinimalInput
                                        label="ARTIST NAME"
                                        value={formData.artistName}
                                        onChange={(e) => handleInputChange("artistName", e.target.value)}
                                        placeholder={user ? user.username : ""}
                                    />

                                    {/* Artist Avatar */}
                                    <div className="flex flex-col md:flex-row items-start gap-12 pt-8">
                                        <div className="group relative w-40 h-40 flex-shrink-0 cursor-pointer">
                                            <div className={`w-full h-full rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center transition-colors relative`}>
                                                {formData.photoPreview ? (
                                                    <Image src={formData.photoPreview} alt="Preview" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
                                                )}
                                            </div>
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="flex-1 space-y-2 pt-2">
                                            <h3 className="font-main text-xl uppercase text-white tracking-wide">Artist Avatar</h3>
                                            <p className="text-white/60 font-light text-sm">Upload a high-resolution image. This will represent you within the Circle.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 02. SOCIAL PRESENCE */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
                                    <SectionHeader number={!user ? "02" : "02"} title="SOCIAL PRESENCE" />
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <MinimalInput
                                            label="Instagram"
                                            placeholder="instagram.com/yourprofile"
                                            value={formData.instagram}
                                            onChange={(e) => handleInputChange("instagram", e.target.value)}
                                            onBlur={() => handleBlur("instagram")}
                                            error={errors.instagram}
                                            verifying={verifying.instagram}
                                            verifiedData={verifiedLinks.instagram}
                                        />
                                        <MinimalInput
                                            label="TikTok"
                                            placeholder="tiktok.com/@yourprofile"
                                            value={formData.tiktok}
                                            onChange={(e) => handleInputChange("tiktok", e.target.value)}
                                            onBlur={() => handleBlur("tiktok")}
                                            error={errors.tiktok}
                                            verifying={verifying.tiktok}
                                            verifiedData={verifiedLinks.tiktok}
                                        />
                                        <MinimalInput
                                            label="Facebook"
                                            placeholder="facebook.com/yourprofile"
                                            value={formData.facebook}
                                            onChange={(e) => handleInputChange("facebook", e.target.value)}
                                            onBlur={() => handleBlur("facebook")}
                                            error={errors.facebook}
                                            verifying={verifying.facebook}
                                            verifiedData={verifiedLinks.facebook}
                                        />
                                        <MinimalInput
                                            label="Youtube"
                                            placeholder="youtube.com/@yourchannel"
                                            value={formData.youtube}
                                            onChange={(e) => handleInputChange("youtube", e.target.value)}
                                            onBlur={() => handleBlur("youtube")}
                                            error={errors.youtube}
                                            verifying={verifying.youtube}
                                            verifiedData={verifiedLinks.youtube}
                                        />
                                        <MinimalInput
                                            label="X"
                                            placeholder="x.com/yourprofile"
                                            value={formData.x}
                                            onChange={(e) => handleInputChange("x", e.target.value)}
                                            onBlur={() => handleBlur("x")}
                                            error={errors.x}
                                            verifying={verifying.x}
                                            verifiedData={verifiedLinks.x}
                                        />
                                        <MinimalInput
                                            label="Website / Linktree"
                                            placeholder="yourwebsite.com"
                                            value={formData.linktree}
                                            onChange={(e) => handleInputChange("linktree", e.target.value)}
                                            onBlur={() => handleBlur("linktree")}
                                            error={errors.linktree}
                                            verifying={verifying.linktree}
                                            verifiedData={verifiedLinks.linktree}
                                        />
                                    </div>
                                </div>
                            </motion.section>

                            {/* 03. MUSIC PLATFORMS */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
                                    <SectionHeader number={!user ? "03" : "03"} title="MUSIC PLATFORMS" />
                                    <div className="grid md:grid-cols-1 gap-8">
                                        <MinimalInput
                                            label="Spotify"
                                            placeholder="open.spotify.com/artist/..."
                                            value={formData.spotify}
                                            onChange={(e) => handleInputChange("spotify", e.target.value)}
                                            onBlur={() => handleBlur("spotify")}
                                            error={errors.spotify}
                                            verifying={verifying.spotify}
                                            verifiedData={verifiedLinks.spotify}
                                        />
                                        <MinimalInput
                                            label="Soundcloud"
                                            placeholder="soundcloud.com/yourprofile"
                                            value={formData.soundcloud}
                                            onChange={(e) => handleInputChange("soundcloud", e.target.value)}
                                            onBlur={() => handleBlur("soundcloud")}
                                            error={errors.soundcloud}
                                            verifying={verifying.soundcloud}
                                            verifiedData={verifiedLinks.soundcloud}
                                        />
                                        <MinimalInput
                                            label="Beatport"
                                            placeholder="beatport.com/artist/yourname"
                                            value={formData.beatport}
                                            onChange={(e) => handleInputChange("beatport", e.target.value)}
                                            onBlur={() => handleBlur("beatport")}
                                            error={errors.beatport}
                                            verifying={verifying.beatport}
                                            verifiedData={verifiedLinks.beatport}
                                        />
                                        <MinimalInput
                                            label="Bandcamp"
                                            placeholder="yourname.bandcamp.com"
                                            value={formData.bandcamp}
                                            onChange={(e) => handleInputChange("bandcamp", e.target.value)}
                                            onBlur={() => handleBlur("bandcamp")}
                                            error={errors.bandcamp}
                                            verifying={verifying.bandcamp}
                                            verifiedData={verifiedLinks.bandcamp}
                                        />
                                        <MinimalInput
                                            label="Apple Music"
                                            placeholder="music.apple.com/artist/yourname"
                                            value={formData.appleMusic}
                                            onChange={(e) => handleInputChange("appleMusic", e.target.value)}
                                            onBlur={() => handleBlur("appleMusic")}
                                            error={errors.appleMusic}
                                            verifying={verifying.appleMusic}
                                            verifiedData={verifiedLinks.appleMusic}
                                        />
                                    </div>
                                </div>
                            </motion.section>

                            {/* 04. EVIDENCE */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
                                    <SectionHeader number={!user ? "04" : "04"} title="Evidence" />
                                    <div className="space-y-8">
                                        <p className="text-white text-xl font-light">
                                            Provide links to up to three of your strongest tracks.
                                            <br />
                                            Please share SoundCloud links only - no sets, playlists, podcasts, or DJ mixes.
                                        </p>
                                        <div className="grid gap-6">
                                            <div>
                                                <MinimalInput label="Track Submission 1" placeholder="https://soundcloud.com/..." value={formData.track1} onChange={(e) => handleInputChange("track1", e.target.value)} error={errors.track1} />
                                                {!errors.track1 && <SoundCloudEmbed url={formData.track1} />}
                                            </div>
                                            <div>
                                                <MinimalInput label="Track Submission 2" placeholder="https://soundcloud.com/..." value={formData.track2} onChange={(e) => handleInputChange("track2", e.target.value)} error={errors.track2} />
                                                {!errors.track2 && <SoundCloudEmbed url={formData.track2} />}
                                            </div>
                                            <div>
                                                <MinimalInput label="Track Submission 3" placeholder="https://soundcloud.com/..." value={formData.track3} onChange={(e) => handleInputChange("track3", e.target.value)} error={errors.track3} />
                                                {!errors.track3 && <SoundCloudEmbed url={formData.track3} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 05. CONTRIBUTION */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-12">
                                    <SectionHeader number={!user ? "05" : "05"} title="CONTRIBUTION" />
                                    <div className="space-y-6">
                                        <label className="font-main text-xl uppercase text-white tracking-wide block mb-4">Production Capabilities</label>
                                        <p className="text-white/60 leading-relaxed font-light text-sm mb-8">
                                            What can you contribute to the Ethereal Techno vault?
                                            <br />
                                            This information helps us understand your skills. Contribution opportunities are optional and may be explored in the future.
                                        </p>
                                        <div className="grid md:grid-cols-3 gap-4 mb-16">
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

                                    <div className="space-y-6">
                                        <label className="font-main text-xl uppercase text-white tracking-wide block mb-4">The Vision</label>
                                        <p className="text-white/60 leading-relaxed font-light text-sm mb-4">
                                            Complete the sentence below in your own words.
                                            <br />
                                            We’re interested in how you perceive Ethereal Techno - think about emotion, atmosphere, intention, or what draws you to this sound.
                                        </p>
                                        <div className="relative group border-b border-white/20 focus-within:border-primary transition-colors">
                                            <textarea
                                                rows={1}
                                                className="w-full bg-transparent border-none py-4 text-xl md:text-2xl font-medium text-white focus:outline-none focus:ring-0 resize-none placeholder:text-white/20"
                                                placeholder=""
                                                value={formData.quote}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Ensure strict prefix
                                                    if (!val.startsWith(PREFIX)) {
                                                        // Prevent deletion of prefix
                                                        handleInputChange("quote", PREFIX);
                                                    } else {
                                                        const target = e.target;
                                                        target.style.height = 'auto';
                                                        target.style.height = `${target.scrollHeight}px`;
                                                        handleInputChange("quote", val);
                                                    }
                                                }}
                                                style={{ height: 'auto', minHeight: '1.5em' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Error Message */}
                            {
                                submitError && (
                                    <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-200 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-mono">{submitError}</span>
                                    </div>
                                )
                            }

                            {/* SUBMIT */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="space-y-8">
                                <div
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => handleInputChange("agreedToTerms", !formData.agreedToTerms)}
                                >
                                    <div className={`w-6 h-6 border border-white/20 flex items-center justify-center transition-colors bg-transparent group-hover:border-white ${formData.agreedToTerms ? "bg-black border-white" : ""}`}>
                                        {formData.agreedToTerms && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>
                                    <span className="text-sm text-white font-medium group-hover:text-white transition-colors select-none">
                                        I have read and agree to the Community Rules and Membership Policy.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !formData.agreedToTerms}
                                    className="w-full relative group overflow-hidden rounded-full"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full py-4 bg-white text-black font-sans font-medium text-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                                    >
                                        <span className="relative z-10">{submitting ? "Submitting..." : "Submit Application"}</span>
                                        <motion.div
                                            className="absolute inset-0 bg-primary z-0 origin-left"
                                            initial={{ scaleX: 0 }}
                                            whileHover={{ scaleX: 1 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </motion.div>
                                </button>
                            </motion.section>

                        </form >
                    </div >
                </main >
            </div >
        </div >
    );
}

// --- SUB-COMPONENTS (Moved outside to prevent re-renders) ---

const MinimalInput: React.FC<MinimalInputProps> = ({
    label, error, prefix, className = "", disabled = false, verifying, verifiedData, ...props
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className={`group relative w-full ${className}`}>
            <div className="flex items-end relative">
                {prefix && <span className={`pb-4 pr-1 font-medium select-none transition-colors duration-300 ${focused ? "text-primary" : "text-white/50"}`}>{prefix}</span>}
                <input
                    className={`
                    block w-full bg-transparent border-b py-2 text-white placeholder:text-white/50 
                    focus:outline-none font-medium text-lg pr-8
                    transition-colors duration-300
                    ${error ? "border-red-500" : verifiedData ? "border-green-500" : "border-white/20"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                    placeholder={label}
                    disabled={disabled}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />

                {/* Animated Bottom Border */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-transparent overflow-hidden pointer-events-none">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: focused ? "0%" : "-100%" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full w-full ${error ? "bg-red-500" : verifiedData ? "bg-green-500" : "bg-primary"}`}
                    />
                </div>

                {/* Verification Status Indicators */}
                <div className="absolute right-0 bottom-4 pb-1">
                    {verifying && <Loader2 className="w-5 h-5 animate-spin text-white/50" />}
                    {!verifying && verifiedData && <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}><Check className="w-5 h-5 text-green-500" /></motion.div>}
                    {!verifying && error && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><AlertCircle className="w-5 h-5 text-red-500" /></motion.div>}
                </div>
            </div>

            <div className="flex justify-between items-start mt-2">
                <label className={`text-xs font-sans uppercase tracking-widest transition-colors duration-300 ${focused ? "text-primary" : "text-white/40"}`}>
                    {label}
                </label>

                {/* Feedback Messages */}
                <div className="text-right">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-lg text-red-500 font-mono block"
                            >
                                {error}
                            </motion.span>
                        )}
                        {verifiedData && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-lg text-green-400 font-mono block max-w-[200px] truncate"
                            >
                                Verified: {verifiedData.title || "Link Active"}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title }) => (
    <div className="flex items-baseline gap-4 mb-8 border-b border-white/5 pb-4">
        <h2 className="text-xs font-sans text-white/40 uppercase tracking-widest">{title}</h2>
    </div>
);

const CapabilityCheckbox: React.FC<CapabilityCheckboxProps> = ({ label, active, onClick, icon: Icon }) => (
    <motion.div
        onClick={onClick}
        initial={false}
        animate={{
            backgroundColor: active ? "#ffffff" : "rgba(255, 255, 255, 0.05)",
            color: active ? "#000000" : "#ffffff",
            borderColor: active ? "#ffffff" : "rgba(255, 255, 255, 0.1)"
        }}
        whileHover={{
            scale: 1.02,
            backgroundColor: active ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
            borderColor: active ? "#ffffff" : "rgba(255, 255, 255, 0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors duration-300"
    >
        <Icon size={20} />
        <span className="text-xs font-sans uppercase tracking-widest">{label}</span>
    </motion.div>
);

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, external }) => (
    <div className="relative w-full">
        <motion.button
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            onClick={onClick}
            className={`
                group w-full flex items-center justify-between py-3 px-4 rounded-xl border border-transparent transition-all duration-300
                ${active ? "bg-white/[0.08] text-white border-white/5" : "text-white/40 hover:text-white hover:border-white/5"}
            `}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-4 h-4 transition-colors ${active ? "text-primary" : "text-white/40 group-hover:text-white"}`} />
                <span className={`text-xs font-sans uppercase tracking-widest transition-colors ${active ? "text-white" : "text-white/40 group-hover:text-white"}`}>
                    {label}
                </span>
            </div>
            {external && <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />}
        </motion.button>
    </div>
);

const SoundCloudEmbed: React.FC<SoundCloudEmbedProps> = ({ url }) => {
    if (!url || !url.includes("soundcloud.com/") || url.includes("/sets/")) return null;

    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;

    return (
        <div className="mt-4 border border-white/10 overflow-hidden">
            <iframe
                title="SoundCloud Player"
                width="100%"
                height="300"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={src}
            />
        </div>
    );
};