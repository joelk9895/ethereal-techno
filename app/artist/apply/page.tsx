"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Loader2,
    Upload,
    Check,
    Disc,
    Mic2,
    Music,
    AlertCircle,
    X
} from "lucide-react";
import { getAuthUser, setAuthUser, logout, AuthUser, authenticatedFetch } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import RightSidebar from "@/app/components/RightSidebar";




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


interface CapabilityCheckboxProps {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ size?: number }>;
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
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
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
        allowContact: true
    });

    const URL_PATTERNS: Record<string, RegExp> = {
        instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.-]+\/?$/,
        tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+\/?$/,
        facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[\w.-]+\/?$/,
        youtube: /^(https?:\/\/)?((www\.)?youtube\.com|music\.youtube\.com)\/.+$/,
        x: /^(https?:\/\/)?(www\.)?x\.com\/[\w.-]+\/?$/,
        linktree: /^(https?:\/\/)?(www\.)?[\w.-]+\.[\w]{2,}(\/.*)?$/,
        spotify: /^(https?:\/\/)?(open\.)?spotify\.com\/artist\/[\w]+\/?$/, // Fixed regex
        soundcloud: /^(https?:\/\/)?(www\.)?soundcloud\.com\/[\w.-]+\/?$/,
        beatport: /^(https?:\/\/)?(www\.)?beatport\.com\/artist\/[\w.-]+\/\d+\/?$/,
        bandcamp: /^(https?:\/\/)?[\w.-]+\.bandcamp\.com\/?$/,
        appleMusic: /^(https?:\/\/)?music\.apple\.com\/[\w]{2}\/artist\/[\w.-]+\/\d+\/?$/,
    };

    const validateField = (field: string, value: string) => {
        if (!value) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            return true;
        }

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
            case 'youtube': isValid = value.includes("youtube.com/") || value.includes("music.youtube.com/"); break;
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

        if (regex && isValid) {
            // simplified loose check: if value exists, let's trust the includes check above for now 
            // or enforce regex. For this fix, relying on the 'includes' switch is safer 
            // if user input varies (http vs https).
        }

        if (!isValid) {
            let errorMsg = customError || `Invalid format. Expected: ${getPlaceholder(field)}`;
            if (field === 'youtube') errorMsg = "Invalid Link.";
            setErrors(prev => ({ ...prev, [field]: errorMsg }));
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
            case 'youtube': return "youtube.com/@yourchannel or music.youtube.com/...";
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
        if (showSuccessModal) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            const response = await authenticatedFetch("/api/artist/apply", {
                method: "GET"
            });

            if (response.ok) {
                const data = await response.json();
                if (data.exists && data.application) {
                    const status = data.application.status;
                    // Only redirect if application is active/approved
                    if (status === "PENDING" || status === "UNDER_REVIEW" || status === "APPROVED") {
                        router.push("/dashboard");
                    }
                }
            }
        } catch (error) {
            console.error("Error checking application:", error);
        }
    }, [router, showSuccessModal]);

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

    const handleNavigation = (id: string) => {
        if (id === "sounds") return router.push("/libraries");
        if (id === "bundles") return router.push("/bundles");
        if (id === "merch") return router.push("/merch");
        if (id === "free-content") return router.push("/free/content");
        if (id === "community") return router.push("/community");

        if (!user) {
            router.push("/signin");
            return;
        }

        switch (id) {
            case "applications": break; // already here
            case "overview": router.push("/dashboard/producer"); break;
            case "profile":
                if (user.type === "ARTIST") router.push("/dashboard/producer/profile");
                else router.push("/dashboard/profile");
                break;
            case "billing": router.push("/dashboard/producer/billing"); break;
            case "orders":
                if (user.type === "ARTIST") router.push("/dashboard/producer/orders");
                else router.push("/dashboard/orders");
                break;
            case "library": router.push("/dashboard/library"); break;
            case "home":
            default: router.push("/dashboard");
        }
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
            if (validationTimeouts.current[field]) {
                clearTimeout(validationTimeouts.current[field]);
            }
            validationTimeouts.current[field] = setTimeout(() => {
                validateField(field, value);
            }, 800);
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

            if (file.size > 20 * 1024 * 1024) {
                setAvatarError("Avatar image must be less than 20MB.");
                e.target.value = "";
                return;
            } else {
                setAvatarError(null);
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: file, photoPreview: reader.result as string }));
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        setSubmitError(null);

        // Mandatory fields check
        const isArtistNameMissing = !formData.artistName && (!user || !user.username);
        const isAvatarMissing = !formData.photoPreview;
        const isTracksMissing = !formData.track1 || !formData.track2 || !formData.track3;

        const normalizeTrack = (t: string) => t ? t.split('?')[0].replace(/\/$/, "").toLowerCase() : "";
        const t1 = normalizeTrack(formData.track1);
        const t2 = normalizeTrack(formData.track2);
        const t3 = normalizeTrack(formData.track3);

        const hasDuplicateTracks = (t1 && t1 === t2) || (t1 && t1 === t3) || (t2 && t2 === t3);
        const isQuoteMissing = formData.quote.trim() === PREFIX.trim() || !formData.quote.trim();
        const isTermsMissing = !formData.agreedToTerms;

        if (isArtistNameMissing || isAvatarMissing || isTracksMissing || isQuoteMissing || isTermsMissing) {
            setSubmitError(isTracksMissing ? "Please include 3 SoundCloud track links that represent your sound before submitting your application." : "Please complete all mandatory fields marked in red.");
            return;
        }

        if (hasDuplicateTracks) {
            setSubmitError("Duplicate links detected. Please submit 3 different SoundCloud tracks.");
            return;
        }

        if (Object.keys(errors).length > 0 || avatarError !== null || Object.values(verifying).some(v => v)) {
            setSubmitError("Please fix the invalid fields before submitting.");
            return;
        }

        setSubmitting(true);

        try {
            let uploadedPhotoUrl = null;
            let uploadedPhotoKey = null;

            if (formData.photo) {
                const photoData = new FormData();
                photoData.append("photo", formData.photo);

                const uploadRes = await fetch("/api/artist/apply/upload-photo", {
                    method: "POST",
                    body: photoData,
                });

                if (uploadRes.ok) {
                    const uploadJson = await uploadRes.json();
                    uploadedPhotoUrl = uploadJson.photoUrl;
                    uploadedPhotoKey = uploadJson.photoKey;
                } else {
                    setSubmitError("Failed to upload the photo. Please try again or use a smaller image.");
                    setSubmitting(false);
                    return;
                }
            }

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
                photoUrl: uploadedPhotoUrl,
                photoKey: uploadedPhotoKey,
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

            const response = await authenticatedFetch("/api/artist/apply", {
                method: "POST",
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

            setShowSuccessModal(true);

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
        <>
        {/* Success Modal */}
        <AnimatePresence>
            {showSuccessModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                    onClick={() => router.push("/dashboard")}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-10 md:p-14 max-w-lg w-full text-center relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Subtle glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10">
                            {/* Animated checkmark */}
                            <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center"
                            >
                                <Check className="w-10 h-10 text-primary" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="font-main text-3xl md:text-4xl uppercase tracking-wide text-white mb-4"
                            >
                                Application Received
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="text-white/50 text-base leading-relaxed mb-10 max-w-sm mx-auto"
                            >
                                Thank you for applying to the Ethereal Techno Circle. Our team will review your submission and get back to you shortly.
                            </motion.p>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                onClick={() => router.push("/dashboard")}
                                className="bg-white text-black font-bold uppercase text-xs tracking-widest px-8 py-4 rounded-full hover:bg-primary transition-colors"
                            >
                                Go to Dashboard
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex h-screen bg-[#121212] text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative pt-20">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                {/* --- RIGHT SIDEBAR (Navigation) --- */}
                {user ? (
                    <RightSidebar
                        user={{
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            name: user.name || "User",
                            surname: user.surname || null,
                            type: user.type,
                            country: null,
                            createdAt: new Date().toISOString(),
                            approvedAt: null
                        }}
                        activeTab="applications"
                        onNavigate={handleNavigation}
                        onSignOut={() => { logout(); router.push("/signin"); }}
                    />
                ) : (
                    <aside className="hidden lg:flex w-80 h-full border-l border-white/10 bg-black/80 backdrop-blur-2xl z-20 pt-24 pb-12 px-8 flex-col justify-between overflow-y-auto no-scrollbar shadow-2xl">
                        <div>
                            <div className="mb-8 px-2">
                                <div className="text-sm font-sans text-white/60 uppercase tracking-widest mb-6">Apply</div>
                                <h1 className="font-main text-4xl text-white uppercase leading-none break-words tracking-wide">
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
                                    <span className="text-sm font-sans uppercase tracking-widest">Login</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                )}

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

                        <form className="space-y-12" onSubmit={handleSubmit}>

                            {!user && (
                                <motion.section variants={fadeInUp} initial="hidden" animate="visible">
                                    <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
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

                            {/* 01. ARTIST IDENTITY */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
                                    {/* Artist Name */}
                                    <MinimalInput
                                        label="ARTIST NAME"
                                        value={formData.artistName}
                                        onChange={(e) => handleInputChange("artistName", e.target.value)}
                                        placeholder={user ? user.username : ""}
                                        error={attemptedSubmit && (!formData.artistName && (!user || !user.username)) ? "Artist name is required" : undefined}
                                    />

                                    {/* Artist Avatar */}
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 pt-8">
                                        {/* Avatar Circle */}
                                        <div className="group relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 cursor-pointer">
                                            <div className={`w-full h-full rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:border-primary/50 relative shadow-2xl`}>
                                                {formData.photoPreview ? (
                                                    <Image src={formData.photoPreview} alt="Preview" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-white/20 group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs tracking-widest uppercase font-medium">Change</span>
                                                </div>
                                            </div>
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>

                                        {/* Error & Info */}
                                        <div className="flex-1 space-y-4 pt-2 text-center md:text-left">
                                            <div>
                                                <p className="text-white text-2xl font-light mb-2">Artist Avatar</p>
                                                <p className="text-white/60 font-light text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                                                    Upload a high-resolution image. This will represent you within the Circle.
                                                    <br />
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/40 tracking-wider">
                                                        Max size: 20Mb
                                                    </span>
                                                </p>
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {(avatarError || (attemptedSubmit && !formData.photoPreview)) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="inline-flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20"
                                                    >
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        <span className="text-sm font-medium">{avatarError || "Avatar is required"}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 02. SOCIAL PRESENCE */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8">
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
                                            label="YouTube / YouTube Music"
                                            placeholder="youtube.com/@yourchannel or music.youtube.com/..."
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
                                    <div className="space-y-8">
                                        <p className="text-white text-xl font-light">
                                            Provide exactly three of your strongest original productions.
                                            <br />
                                            SoundCloud track links only. Must be distinct.
                                        </p>
                                        <div className="grid gap-6">
                                            <div>
                                                <MinimalInput label="Track Submission 1" placeholder="https://soundcloud.com/..." value={formData.track1} onChange={(e) => handleInputChange("track1", e.target.value)} error={errors.track1 || (attemptedSubmit && !formData.track1 ? "Track 1 is required" : undefined)} />
                                                {!errors.track1 && formData.track1 && <SoundCloudEmbed url={formData.track1} />}
                                            </div>
                                            <div>
                                                <MinimalInput label="Track Submission 2" placeholder="https://soundcloud.com/..." value={formData.track2} onChange={(e) => handleInputChange("track2", e.target.value)} error={errors.track2 || (attemptedSubmit && !formData.track2 ? "Track 2 is required" : undefined)} />
                                                {!errors.track2 && formData.track2 && <SoundCloudEmbed url={formData.track2} />}
                                            </div>
                                            <div>
                                                <MinimalInput label="Track Submission 3" placeholder="https://soundcloud.com/..." value={formData.track3} onChange={(e) => handleInputChange("track3", e.target.value)} error={errors.track3 || (attemptedSubmit && !formData.track3 ? "Track 3 is required" : undefined)} />
                                                {!errors.track3 && formData.track3 && <SoundCloudEmbed url={formData.track3} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 05. CONTRIBUTION */}
                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-12">
                                    <div className="space-y-8">
                                        <p className="text-white text-xl font-light">
                                            If we collaborate in the future, what would you enjoy creating for the Ethereal Techno sound library?
                                            <br />
                                            This is optional and simply helps us understand your creative strengths.
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

                                    <div className="space-y-8 mt-12 pt-12 border-t border-white/5">
                                        <p className="text-white text-xl font-light mb-4">
                                            In your own words, what is Ethereal Techno to you?
                                            <br />
                                            Think about emotion, atmosphere, and intention.
                                        </p>
                                        <div className={`relative group border-b transition-colors ${attemptedSubmit && (formData.quote.trim() === PREFIX.trim() || !formData.quote.trim()) ? "border-red-500" : "border-white/20 focus-within:border-primary"}`}>
                                            <textarea
                                                rows={1}
                                                className="w-full bg-transparent border-none py-4 text-xl md:text-2xl font-medium text-white focus:outline-none focus:ring-0 resize-none placeholder:text-white/20"
                                                placeholder=""
                                                value={formData.quote}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (!val.startsWith(PREFIX)) {
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
                                            {attemptedSubmit && (formData.quote.trim() === PREFIX.trim() || !formData.quote.trim()) && (
                                                <div className="absolute -bottom-6 right-0 text-red-500 font-mono text-xs">Please complete your Ethereal Techno statement before submitting your application.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="space-y-8">
                                <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-white/5 space-y-8 mb-8">
                                    <label className="text-lg font-mono text-white uppercase mb-4 block">Contact Preferences</label>
                                    <div
                                        className="flex items-start gap-4 cursor-pointer group"
                                        onClick={() => handleInputChange("allowContact", !formData.allowContact)}
                                    >
                                        <div className={`w-6 h-6 border border-white/20 flex items-center justify-center transition-colors bg-transparent group-hover:border-white ${formData.allowContact ? "bg-black border-white" : ""}`}>
                                            {formData.allowContact && <Check size={14} color="white" strokeWidth={3} />}
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-sm text-white font-medium group-hover:text-white transition-colors select-none block">
                                                Connect with fellow Verified Producers.
                                            </span>
                                            <p className="text-white/60 text-xs font-light">
                                                Only verified Ethereal Techno producers can message you.
                                                <br />
                                                Your email is never shared. All communication stays inside the platform.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="flex items-start gap-4 cursor-pointer group"
                                    onClick={() => handleInputChange("agreedToTerms", !formData.agreedToTerms)}
                                >
                                    <div className={`w-6 h-6 border border-white/20 flex items-center justify-center transition-colors bg-transparent group-hover:border-white ${formData.agreedToTerms ? "bg-black border-white" : ""}`}>
                                        {formData.agreedToTerms && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-sm font-medium transition-colors select-none ${attemptedSubmit && !formData.agreedToTerms ? "text-red-400 group-hover:text-red-300" : "text-white group-hover:text-white"}`}>
                                        I have read and agree to the <Link href="/community-rules" target="_blank" className="underline hover:text-primary transition-colors cursor-pointer" onClick={(e: React.MouseEvent) => e.stopPropagation()}>Ethereal Techno Community Rules and Membership Policy</Link>.
                                    </span>
                                </div>

                                {/* Error Message directly above submit */}
                                <AnimatePresence>
                                    {submitError && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 rounded-xl border border-red-500/50 bg-red-500/10 text-red-200 flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm font-mono">{submitError}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full relative group overflow-hidden rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full py-4 bg-white text-black font-sans font-medium text-sm uppercase tracking-wide rounded-full"
                                    >
                                        <span className="relative z-10">{submitting ? "Submitting..." : "Submit Application"}</span>
                                        <div className="absolute inset-0 bg-primary z-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                                    </motion.div>
                                </button>
                            </motion.section>

                        </form >
                    </div >
                </main >
            </div >
        </div >
        </>
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
                    focus:outline-none font-medium text-lg pr-16
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

                {/* Verification Status Indicators & Clear Button */}
                <div className="absolute right-0 bottom-4 pb-1 pr-2 flex items-center gap-2">
                    {verifying && <Loader2 className="w-5 h-5 animate-spin text-white/50" />}
                    {!verifying && verifiedData && <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}><Check className="w-5 h-5 text-green-500" /></motion.div>}
                    {!verifying && error && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><AlertCircle className="w-5 h-5 text-red-500" /></motion.div>}

                    <AnimatePresence>
                        {props.value && !disabled && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (props.onChange) {
                                        props.onChange({
                                            target: { value: "" },
                                            currentTarget: { value: "" }
                                        } as React.ChangeEvent<HTMLInputElement>);
                                    }
                                }}
                                className="text-white/30 hover:text-white transition-colors cursor-pointer outline-none ml-1"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
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
                                className="text-xs text-red-500 font-mono block"
                            >
                                {error}
                            </motion.span>
                        )}
                        {verifiedData && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-xs text-green-400 font-mono block max-w-[200px] truncate"
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