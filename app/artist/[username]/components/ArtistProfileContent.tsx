"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Instagram,
    Facebook,
    Youtube,
    Link as LinkIcon,
    Mic2,
    Award,
    Music,
    Play
} from "lucide-react";
import { motion } from "framer-motion";
import { ShareModal } from "./ShareModal";
import { AccessDeniedModal } from "./AccessDeniedModal";
import { MessageModal } from "./MessageModal";

// Custom Icons
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const SoundCloudIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 640 640" fill="currentColor" className={className}>
        <path d="M640.2 362.6C638.9 385.7 628.7 407.4 611.8 423.1C594.9 438.8 572.6 447.5 549.5 447.2L331.5 447.2C326.7 447.2 322.1 445.2 318.7 441.8C315.3 438.4 313.4 433.8 313.4 429L313.4 194.2C313.2 190.2 314.3 186.2 316.5 182.8C318.7 179.4 321.8 176.7 325.5 175.1C325.5 175.1 345.6 161.2 387.8 161.2C413.6 161.2 438.9 168.1 461.1 181.3C478.4 191.5 493.4 205.1 505.2 221.4C517 237.7 525.2 256.2 529.4 275.8C536.9 273.7 544.7 272.6 552.5 272.6C564.2 272.5 575.8 274.8 586.7 279.3C597.6 283.8 607.2 290.6 615.4 299C623.6 307.4 630 317.3 634.3 328.3C638.6 339.3 640.6 350.9 640.2 362.6zM286.2 209.1C286.3 208.1 286.2 207.1 285.9 206.2C285.6 205.3 285.1 204.4 284.4 203.6C283.7 202.8 282.9 202.3 282 201.9C280.2 201.1 278 201.1 276.2 201.9C275.3 202.3 274.5 202.9 273.8 203.6C273.1 204.3 272.6 205.2 272.3 206.2C272 207.2 271.9 208.1 272 209.1C266 288 261.4 362 272 440.7C272.2 442.4 273 444 274.3 445.2C276.9 447.6 281.1 447.6 283.7 445.2C285 444 285.8 442.4 286 440.7C297.3 361.3 292.6 288.7 286 209.1L286.2 209.1zM242.2 236.4C242 234.6 241.1 232.9 239.8 231.7C238.5 230.5 236.7 229.8 234.8 229.8C232.9 229.8 231.2 230.5 229.8 231.7C228.4 232.9 227.6 234.6 227.4 236.4C219.5 304.3 219.5 372.9 227.4 440.8C227.7 442.6 228.6 444.2 229.9 445.3C231.2 446.4 233 447.1 234.7 447.1C236.4 447.1 238.2 446.5 239.5 445.3C240.8 444.1 241.7 442.5 242 440.8C250.8 373 250.8 304.3 242.1 236.4L242.2 236.4zM197.9 229.5C197.7 227.7 196.9 226.1 195.6 224.9C194.3 223.7 192.6 223.1 190.8 223.1C189 223.1 187.3 223.8 186 224.9C184.7 226 183.9 227.7 183.7 229.5C177 301.5 173.5 368.8 183.7 440.6C183.7 442.5 184.4 444.3 185.8 445.6C187.2 446.9 188.9 447.7 190.8 447.7C192.7 447.7 194.5 447 195.8 445.6C197.1 444.2 197.9 442.5 197.9 440.6C208.4 367.8 205.2 302.4 198 229.5L197.9 229.5zM153.9 250.1C153.9 248.2 153.1 246.3 151.8 244.9C150.5 243.5 148.6 242.8 146.6 242.8C144.6 242.8 142.8 243.6 141.4 244.9C140 246.2 139.3 248.1 139.3 250.1C131.2 313.4 131.2 377.6 139.3 440.9C139.5 442.7 140.3 444.3 141.7 445.5C143.1 446.7 144.8 447.4 146.5 447.4C148.2 447.4 150 446.7 151.3 445.5C152.6 444.3 153.5 442.7 153.7 440.9C162.5 377.6 162.6 313.4 154 250.1L153.9 250.1zM109.4 297.7C109.4 295.8 108.6 293.9 107.3 292.6C106 291.3 104.1 290.5 102.2 290.5C100.3 290.5 98.4 291.3 97.1 292.6C95.8 293.9 95 295.8 95 297.7C84.5 346.9 89.5 391.6 95.4 441.3C95.7 442.9 96.5 444.4 97.7 445.5C98.9 446.6 100.5 447.2 102.2 447.2C103.9 447.2 105.4 446.6 106.7 445.5C108 444.4 108.8 443 109 441.3C115.6 390.9 120.6 347.2 109.4 297.7zM65.3 290.2C65.1 288.4 64.2 286.7 62.9 285.4C61.6 284.1 59.7 283.5 57.9 283.5C56.1 283.5 54.3 284.2 52.9 285.4C51.5 286.6 50.7 288.3 50.5 290.2C41.2 340.4 44.3 384.6 50.8 434.7C51.5 442.3 64.4 442.2 65.2 434.7C72.4 383.8 75.7 340.9 65.5 290.2L65.3 290.2zM20.7 314.8C20.5 313 19.6 311.3 18.3 310C17 308.7 15.1 308.1 13.3 308.1C11.5 308.1 9.7 308.8 8.3 310C6.9 311.2 6 312.9 5.9 314.8C-2.6 348.5 0 376.4 6.5 410.2C6.7 411.9 7.5 413.5 8.8 414.6C10.1 415.7 11.7 416.4 13.5 416.4C15.3 416.4 16.9 415.8 18.2 414.6C19.5 413.4 20.3 411.9 20.5 410.2C28 375.7 31.7 348.4 20.9 314.8L20.7 314.8z" />
    </svg>
);

const BeatportIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M21.429 17.055a7.114 7.114 0 0 1 -0.794 3.246 6.917 6.917 0 0 1 -2.181 2.492 6.698 6.698 0 0 1 -3.063 1.163 6.653 6.653 0 0 1 -3.239 -0.434 6.796 6.796 0 0 1 -2.668 -1.932 7.03 7.03 0 0 1 -1.481 -2.983 7.124 7.124 0 0 1 0.049 -3.345 7.015 7.015 0 0 1 1.566 -2.937l-4.626 4.73 -2.421 -2.479 5.201 -5.265a3.791 3.791 0 0 0 1.066 -2.675V0h3.41v6.613a7.172 7.172 0 0 1 -0.519 2.794 7.02 7.02 0 0 1 -1.559 2.353l-0.153 0.156a6.768 6.768 0 0 1 3.49 -1.725 6.687 6.687 0 0 1 3.845 0.5 6.873 6.873 0 0 1 2.959 2.564 7.118 7.118 0 0 1 1.118 3.8Zm-3.089 0a3.89 3.89 0 0 0 -0.611 -2.133 3.752 3.752 0 0 0 -1.666 -1.424 3.65 3.65 0 0 0 -2.158 -0.233 3.704 3.704 0 0 0 -1.92 1.037 3.852 3.852 0 0 0 -1.031 1.955 3.908 3.908 0 0 0 0.205 2.213c0.282 0.7 0.76 1.299 1.374 1.721a3.672 3.672 0 0 0 2.076 0.647 3.637 3.637 0 0 0 2.635 -1.096c0.347 -0.351 0.622 -0.77 0.81 -1.231 0.188 -0.461 0.285 -0.956 0.286 -1.456Z" />
    </svg>
);

const BandcampIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M8 0.25C3.71875 0.25 0.25 3.71875 0.25 8s3.46875 7.75 7.75 7.75 7.75 -3.46875 7.75 -7.75S12.28125 0.25 8 0.25Zm1.50625 10.190625h-5.65625L6.496875 5.5625h5.65625Z" />
    </svg>
);

const AppleMusicIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="m10.995 0 .573.001q.241 0 .483.007c.35.01.705.03 1.051.093.352.063.68.166.999.329a3.36 3.36 0 0 1 1.47 1.468c.162.32.265.648.328 1 .063.347.084.7.093 1.051q.007.241.007.483l.001.573v5.99l-.001.573q0 .241-.008.483c-.01.35-.03.704-.092 1.05a3.5 3.5 0 0 1-.33 1 3.36 3.36 0 0 1-1.468 1.468 3.5 3.5 0 0 1-1 .33 7 7 0 0 1-1.05.092q-.241.007-.483.008l-.573.001h-5.99l-.573-.001q-.241 0-.483-.008a7 7 0 0 1-1.052-.092 3.6 3.6 0 0 1-.998-.33 3.36 3.36 0 0 1-1.47-1.468 3.6 3.6 0 0 1-.328-1 7 7 0 0 1-.093-1.05Q.002 11.81 0 11.568V5.005l.001-.573q0-.241.007-.483c.01-.35.03-.704.093-1.05a3.6 3.6 0 0 1 .329-1A3.36 3.36 0 0 1 1.9.431 3.5 3.5 0 0 1 2.896.1 7 7 0 0 1 3.95.008Q4.19.002 4.432 0h.573zm-.107 2.518-4.756.959H6.13a.66.66 0 0 0-.296.133.5.5 0 0 0-.16.31c-.004.027-.01.08-.01.16v5.952c0 .14-.012.275-.106.39-.095.115-.21.15-.347.177l-.31.063c-.393.08-.65.133-.881.223a1.4 1.4 0 0 0-.519.333 1.25 1.25 0 0 0-.332.995c.031.297.166.582.395.792.156.142.35.25.578.296.236.047.49.031.858-.043.196-.04.38-.102.555-.205a1.4 1.4 0 0 0 .438-.405 1.5 1.5 0 0 0 .233-.55c.042-.202.052-.386.052-.588V6.347c0-.276.08-.35.302-.404.024-.005 3.954-.797 4.138-.833.257-.049.378.025.378.294v3.524c0 .14-.001.28-.096.396-.094.115-.211.15-.348.178l-.31.062c-.393.08-.649.133-.88.223a1.4 1.4 0 0 0-.52.334 1.26 1.26 0 0 0-.34.994c.03.297.174.582.404.792a1.2 1.2 0 0 0 .577.294c.237.048.49.03.858-.044.197-.04.381-.098.556-.202a1.4 1.4 0 0 0 .438-.405q.173-.252.233-.549a2.7 2.7 0 0 0 .044-.589V2.865c0-.273-.143-.443-.4-.42-.04.003-.383.064-.424.073" />
    </svg>
);

interface ArtistApplication {
    artistName: string;
    quote?: string | null;
    photoUrl?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    x?: string | null;
    linktree?: string | null;
    spotify?: string | null;
    soundcloud?: string | null;
    beatport?: string | null;
    bandcamp?: string | null;
    appleMusic?: string | null;
    track1?: string | null;
    track2?: string | null;
    track3?: string | null;
}

interface User {
    name?: string | null;
    country?: string | null;
    createdAt: Date | string;
}

interface ArtistProfileContentProps {
    profile: ArtistApplication;
    user: User;
    username: string;
}

interface SoundCloudTrack {
    thumbnail_url: string;
    title: string;
}

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" as const }
    }
};

// Slot Machine Text Animation
const SlotText = ({ text, className }: { text: string, className?: string }) => {
    const letters = text.split("");

    return (
        <div className={`overflow-hidden flex flex-wrap justify-center md:justify-start ${className}`} style={{ perspective: "400px" }}>
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: index * 0.05
                    }}
                    className="inline-block"
                >
                    <motion.span
                        initial={{ y: "100%", rotateX: -90 }}
                        animate={{ y: 0, rotateX: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.2, 0.65, 0.3, 0.9] as const,
                            delay: index * 0.05
                        }}
                        className="inline-block origin-bottom"
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                </motion.span>
            ))}
        </div>
    );
};

export default function ArtistProfileContent({ profile, user, username }: ArtistProfileContentProps) {
    const artistName = profile?.artistName || user.name || username;
    const bio = profile?.quote || "Verified Artist on Ethereal Techno.";
    const photoUrl = profile?.photoUrl;
    const country = user.country || "Global";
    const memberSince = new Date(user.createdAt).getFullYear();

    const [shareOpen, setShareOpen] = useState(false);
    const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);
    const [messageModalOpen, setMessageModalOpen] = useState(false);

    const handleMessageClick = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
        if (!token) {
            setAccessDeniedOpen(true);
            return;
        }

        fetch("/api/auth/verify", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.user && data.user.type === "ARTIST") {
                    setMessageModalOpen(true);
                } else {
                    setAccessDeniedOpen(true);
                }
            })
            .catch(() => setAccessDeniedOpen(true));
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans relative overflow-hidden">

            {/* Modals */}
            <ShareModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                artistName={artistName}
                url={typeof window !== 'undefined' ? window.location.href : ""}
            />
            <AccessDeniedModal
                isOpen={accessDeniedOpen}
                onClose={() => setAccessDeniedOpen(false)}
            />
            <MessageModal
                isOpen={messageModalOpen}
                onClose={() => setMessageModalOpen(false)}
                artistName={artistName}
            />

            {/* Background Ambient Animation - S REMOVED to fix visual artifact (Square Box) reported by user */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
            </div>

            <div className="relative z-10 w-full px-6 md:px-12 py-24 md:py-32">

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-12 mb-24 border-b border-white/10 pb-16">

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={scaleIn}
                        className="relative group shrink-0"
                    >
                        <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border border-white/10 p-1 relative z-10 bg-black">
                            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 relative">
                                {photoUrl ? (
                                    <Image
                                        src={photoUrl}
                                        alt={artistName}
                                        fill
                                        sizes="(max-width: 768px) 224px, 256px"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <Mic2 size={48} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Decorative Rings - Animated */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-white/5 scale-110 z-0 pointer-events-none border-dashed"
                        ></motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-white/5 scale-125 z-0 pointer-events-none"
                        ></motion.div>
                    </motion.div>

                    {/* Name & Info */}
                    <div className="flex-1 space-y-8 w-full text-center md:text-left">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="space-y-4"
                        >
                            <motion.div variants={fadeInUp} className="flex items-center justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-lg font-mono uppercase tracking-widest flex items-center gap-2">
                                    <Award size={14} /> Verified Producer
                                </span>
                            </motion.div>

                            <div className="overflow-hidden">
                                <SlotText
                                    text={artistName}
                                    className="text-7xl md:text-9xl font-main uppercase leading-none tracking-wide break-words"
                                />
                            </div>

                            <motion.div variants={fadeInUp} className="flex items-center justify-center md:justify-start gap-6 text-lg font-mono text-white/50 uppercase tracking-wide pt-2">
                                <span className="flex items-center gap-2"><span className="text-white/30">BASED IN</span> {country}</span>
                                <span className="flex items-center gap-2"><span className="text-white/30">MEMBER SINCE</span> {memberSince}</span>
                            </motion.div>
                        </motion.div>

                        {/* Social Row & Share */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4"
                        >
                            {/* Social Icons */}
                            <div className="flex flex-wrap items-center gap-3">
                                {[
                                    { href: profile?.instagram, icon: Instagram, label: "Instagram" },
                                    { href: profile?.tiktok, icon: TikTokIcon, label: "TikTok" },
                                    { href: profile?.facebook, icon: Facebook, label: "Facebook" },
                                    { href: profile?.youtube, icon: Youtube, label: "YouTube" },
                                    { href: profile?.x, icon: XIcon, label: "X" },
                                    { href: profile?.linktree, icon: LinkIcon, label: "Linktree" }
                                ].map((social, index) => (
                                    <motion.div key={index} variants={fadeInUp}>
                                        <SocialLink href={social.href} icon={social.icon} label={social.label} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Share Action */}
                            <motion.button
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShareOpen(true)}
                                className="flex items-center gap-3 group px-4 py-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <span className="text-lg font-mono uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">Share the Artist</span>
                                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                                    <LinkIcon size={14} />
                                </div>
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* --- Grid Content + Sidebar --- */}
                <div className="grid lg:grid-cols-[350px_1fr] gap-16 border-b border-white/10 pb-24 mb-24">

                    {/* Left Sidebar: Listen + Reach Out */}
                    <div className="space-y-16">

                        {/* Listen Elsewhere */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="space-y-8"
                        >
                            <motion.h2 variants={fadeInUp} className="text-2xl font-mono text-white/40 uppercase tracking-widest">Listen Elsewhere</motion.h2>
                            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                                <PlatformLink href={profile?.spotify} icon={SpotifyIcon} label="Spotify" />
                                <PlatformLink href={profile?.soundcloud} icon={SoundCloudIcon} label="Soundcloud" />
                                <PlatformLink href={profile?.beatport} icon={BeatportIcon} label="Beatport" />
                                <PlatformLink href={profile?.bandcamp} icon={BandcampIcon} label="Bandcamp" />
                                <PlatformLink href={profile?.appleMusic} icon={AppleMusicIcon} label="Apple Music" />
                            </motion.div>
                        </motion.div>

                        {/* Reach Out */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="space-y-8"
                        >
                            <h2 className="text-2xl font-mono text-white/40 uppercase tracking-widest">Reach Out</h2>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleMessageClick}
                                className="w-full py-4 bg-primary text-black font-main text-2xl uppercase tracking-widest hover:bg-white transition-colors"
                            >
                                Send a Message
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Right Content: Selected Works */}
                    <div className="space-y-12">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="space-y-8"
                        >
                            <motion.h2 variants={fadeInUp} className="text-2xl font-mono text-white/40 uppercase tracking-widest">Selected Works</motion.h2>

                            {(profile?.track1 || profile?.track2 || profile?.track3) ? (
                                <div className="grid md:grid-cols-3 gap-6">
                                    {profile?.track1 && <motion.div variants={fadeInUp}><SoundCloudEmbed url={profile.track1} /></motion.div>}
                                    {profile?.track2 && <motion.div variants={fadeInUp}><SoundCloudEmbed url={profile.track2} /></motion.div>}
                                    {profile?.track3 && <motion.div variants={fadeInUp}><SoundCloudEmbed url={profile.track3} /></motion.div>}
                                </div>
                            ) : (
                                <motion.div variants={fadeInUp} className="text-white/30 text-lg font-light italic">
                                    No tracks selected yet.
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* --- Statement Section (Bottom) --- */}
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-mono text-white/40 uppercase tracking-widest mb-8">Statement</h2>
                        <p className="text-4xl md:text-6xl font-main leading-tight text-white/90 tracking-wide">
                            &ldquo;{bio}&rdquo;
                        </p>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

// --- Subcomponents ---

function SocialLink({ href, icon: Icon, label }: { href?: string | null, icon: React.ComponentType<{ className?: string }>, label: string }) {
    if (!href) return null;
    const url = href.startsWith('http') ? href : `https://${href}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/50 hover:text-black hover:bg-white hover:border-white transition-all duration-300 transform hover:scale-110"
            title={label}
        >
            <Icon className="w-4 h-4" />
        </a>
    );
}

function PlatformLink({ href, icon: Icon, label }: { href?: string | null, icon: React.ComponentType<{ className?: string }>, label: string }) {
    if (!href) return null;
    const url = href.startsWith('http') ? href : `https://${href}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
            title={label}
        >
            <div className="w-12 h-12 flex items-center justify-center border border-white/20 rounded-lg group-hover:border-primary group-hover:text-primary transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            {/* Label Removed per request */}
        </a>
    );
}

const SoundCloudEmbed = ({ url }: { url: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackData, setTrackData] = useState<SoundCloudTrack | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url) return;

        let finalUrl = url;
        if (!finalUrl.startsWith("https://")) {
            finalUrl = `https://${finalUrl}`;
        }

        if (!finalUrl.includes("soundcloud") || finalUrl.includes("/sets/")) {
            setError(true);
            return;
        }

        // Fetch data from our proxy
        fetch(`/api/soundcloud?url=${encodeURIComponent(finalUrl)}`)
            .then(res => res.json())
            .then(data => {
                if (data.thumbnail_url) {
                    setTrackData(data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    }, [url]);

    if (error || !url) return null;

    if (isPlaying) {
        const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true`;
        return (
            <div className="aspect-square w-full border border-white/10 bg-neutral-900">
                <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={src}
                />
            </div>
        );
    }

    return (
        <div
            className="group relative aspect-square w-full border border-white/10 bg-neutral-900 cursor-pointer overflow-hidden"
            onClick={() => setIsPlaying(true)}
        >
            {trackData?.thumbnail_url ? (
                <Image
                    src={trackData.thumbnail_url}
                    alt={trackData.title || "SoundCloud Track"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <Music size={48} />
                </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 border border-white/20">
                    <Play size={32} fill="currentColor" className="ml-1" />
                </div>
            </div>
        </div>
    );
};
