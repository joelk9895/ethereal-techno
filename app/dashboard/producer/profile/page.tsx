"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Camera, Save, Loader2, Link2, ExternalLink, Globe, MapPin, Edit2, Instagram, Facebook, Youtube } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { motion, AnimatePresence, useTransform, useMotionValue, useSpring } from "framer-motion";
import Loading from "@/app/components/general/loading";
import { cn } from "@/lib/utils";

interface ProfileFormData {
    artistName?: string;
    city?: string | null;
    country?: string | null;
    quote?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    x?: string | null;
    linktree?: string | null;
    soundcloud?: string | null;
    spotify?: string | null;
    beatport?: string | null;
    bandcamp?: string | null;
    appleMusic?: string | null;
}

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

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xl font-bold text-white mb-4 px-1">{title}</h3>
);

const InputRow: React.FC<{
    label: string,
    value: string | null | undefined,
    onChange: (value: string) => void,
    placeholder?: string,
    icon?: React.ReactNode,
    last?: boolean,
    isEditing: boolean
}> = ({ label, value, onChange, placeholder, icon, last, isEditing }) => (
    <div className={`flex items-center gap-4 py-4 px-4 bg-white/5 transition-colors ${!last ? 'border-b border-white/5' : ''}`}>
        <div className="w-8 flex items-center justify-center text-white/40">
            {icon || <Link2 className="w-5 h-5" />}
        </div>
        <div className="flex-1 space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50">
                {label}
            </label>
            {isEditing ? (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-white/20 transition-all font-medium border border-white/5 focus:border-white/10"
                    />
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-9 flex items-center text-white font-medium text-sm">
                    {value || <span className="text-white/20 italic text-xs">Not set</span>}
                </motion.div>
            )}
        </div>
    </div>
);

export default function ProducerProfilePage() {
    const [profileForm, setProfileForm] = useState<ProfileFormData>({});
    const [artistPhoto, setArtistPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const scrollY = useMotionValue(0);
    const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 10, mass: 0.5 });

    const headerScale = useTransform(smoothScrollY, [0, 80], [1, 0.6]);
    const headerY = useTransform(smoothScrollY, [0, 80], [0, -70]);

    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;

        const handleScroll = () => {
            scrollY.set(main.scrollTop);
        };

        main.addEventListener('scroll', handleScroll);
        return () => main.removeEventListener('scroll', handleScroll);
    }, [scrollY]);

    useEffect(() => {
        const fetchProfile = async () => {
            const profileRes = await authenticatedFetch("/api/producer/profile");
            if (profileRes.ok) {
                const data = await profileRes.json();
                setProfileForm(data.producer);
                setArtistPhoto(data.producer.artistPhoto);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await authenticatedFetch("/api/producer/profile", {
                method: "PATCH",
                body: JSON.stringify(profileForm),
            });
            if (res.ok) {
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
            setIsEditing(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("photo", file);

        try {
            const res = await authenticatedFetch("/api/producer/upload-photo", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                setArtistPhoto(data.photoUrl);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full mx-auto pb-20"
        >
            <div className="flex items-center justify-between mb-8 md:mb-12 sticky top-0 z-50 pt-24 py-4 border-b border-white/5 -mx-6 px-6 md:-mx-12 md:px-12 lg:-mx-0 lg:px-0  lg:border-none">
                <div className="w-[calc(100%+8rem)] absolute top-0 left-[-4rem] z-[-1] h-full [mask:linear-gradient(black,transparent)] backdrop-blur-xl"></div>
                <div className="flex items-center gap-4">
                    <motion.h2
                        className="font-main uppercase text-5xl md:text-7xl text-white origin-left"
                        style={{
                            scale: headerScale,
                            y: headerY,
                        }}
                    >
                        Artist Identity
                    </motion.h2>
                </div>

                <motion.button
                    layout
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    disabled={saving}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 active:scale-95 duration-200 rounded-full shadow-lg shadow-white/10 overflow-hidden",
                        isEditing ? "bg-white text-black hover:bg-primary" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                    initial={false}
                    style={{ y: headerY }}
                    animate={{
                        width: isEditing ? 160 : 140,
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.span
                                key="save"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center justify-center gap-2 w-full text-nowrap"
                            >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Save Changes
                            </motion.span>
                        ) : (
                            <motion.span
                                key="edit"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-center gap-2 w-full text-nowrap"
                            >
                                <Edit2 className="w-3 h-3" />
                                Edit Profile
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            <div className="relative mb-12 group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 rounded-[2.5rem]" />

                <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-zinc-900/40 border border-white/5 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-md">

                    <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 bg-black shadow-2xl relative z-10">
                            {artistPhoto ? (
                                <Image src={artistPhoto} alt="Profile" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <User className="w-20 h-20 text-white/20" />
                                </div>
                            )}
                        </div>
                        <AnimatePresence>
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 rounded-full bg-black/60 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                                >
                                    <Camera className="w-8 h-8 text-white mb-2" />
                                    <span className="text-[10px] font-mono uppercase text-white/80">Change Photo</span>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Name & Bio Editor */}
                    <div className="flex-1 w-full text-center md:text-left space-y-6">
                        <div className="space-y-2 group/input">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 pl-1 group-focus-within/input:text-primary transition-colors">Artist Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileForm.artistName || ""}
                                    onChange={(e) => setProfileForm({ ...profileForm, artistName: e.target.value })}
                                    placeholder="Artist Name"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-3xl md:text-5xl font-main text-white focus:outline-none focus:border-primary/50 placeholder:text-white/10 uppercase tracking-tight transition-all"
                                />
                            ) : (
                                <div className="px-6 py-4 text-3xl md:text-5xl font-main text-white uppercase tracking-tight min-h-[5.5rem] flex items-center justify-center md:justify-start">
                                    {profileForm.artistName || "Artist Name"}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 group/input">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 pl-1 group-focus-within/input:text-primary transition-colors">Tagline / Bio</label>
                            {isEditing ? (
                                <textarea
                                    value={profileForm.quote || ""}
                                    onChange={(e) => setProfileForm({ ...profileForm, quote: e.target.value })}
                                    placeholder="Short bio or tagline..."
                                    rows={2}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-lg md:text-xl text-white/80 focus:text-white focus:outline-none focus:border-primary/50 placeholder:text-white/10 resize-none font-light leading-relaxed transition-all"
                                />
                            ) : (
                                <div className="px-6 py-4 text-lg md:text-xl text-white/80 font-light leading-relaxed min-h-[5rem] flex items-center justify-center md:justify-start">
                                    {profileForm.quote || <span className="text-white/20 italic">No bio set</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="space-y-8">

                    <div>
                        <SectionHeader title="Location" />
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                            <InputRow
                                label="City"
                                value={profileForm.city}
                                onChange={(v) => setProfileForm({ ...profileForm, city: v })}
                                icon={<MapPin className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Country"
                                value={profileForm.country}
                                onChange={(v) => setProfileForm({ ...profileForm, country: v })}
                                icon={<Globe className="w-5 h-5" />}
                                last
                                isEditing={isEditing}
                            />
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Connect" />
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                            <InputRow
                                label="Instagram"
                                value={profileForm.instagram}
                                onChange={(v) => setProfileForm({ ...profileForm, instagram: v })}
                                placeholder="@username"
                                icon={<Instagram className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="TikTok"
                                value={profileForm.tiktok}
                                onChange={(v) => setProfileForm({ ...profileForm, tiktok: v })}
                                placeholder="@username"
                                icon={<TikTokIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="YouTube"
                                value={profileForm.youtube}
                                onChange={(v) => setProfileForm({ ...profileForm, youtube: v })}
                                placeholder="Channel URL"
                                icon={<Youtube className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Facebook"
                                value={profileForm.facebook}
                                onChange={(v) => setProfileForm({ ...profileForm, facebook: v })}
                                placeholder="Page URL"
                                icon={<Facebook className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="X (Twitter)"
                                value={profileForm.x}
                                onChange={(v) => setProfileForm({ ...profileForm, x: v })}
                                placeholder="@username"
                                icon={<XIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Linktree / Website"
                                value={profileForm.linktree}
                                onChange={(v) => setProfileForm({ ...profileForm, linktree: v })}
                                placeholder="https://..."
                                last
                                icon={<ExternalLink className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: PLATFORMS */}
                <div className="space-y-8">
                    <div>
                        <SectionHeader title="Music Platforms" />
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                            <InputRow
                                label="Spotify"
                                value={profileForm.spotify}
                                onChange={(v) => setProfileForm({ ...profileForm, spotify: v })}
                                placeholder="Spotify Artist URL"
                                icon={<SpotifyIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="SoundCloud"
                                value={profileForm.soundcloud}
                                onChange={(v) => setProfileForm({ ...profileForm, soundcloud: v })}
                                placeholder="SoundCloud Profile URL"
                                icon={<SoundCloudIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Apple Music"
                                value={profileForm.appleMusic}
                                onChange={(v) => setProfileForm({ ...profileForm, appleMusic: v })}
                                placeholder="Apple Music Artist URL"
                                icon={<AppleMusicIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Beatport"
                                value={profileForm.beatport}
                                onChange={(v) => setProfileForm({ ...profileForm, beatport: v })}
                                placeholder="Beatport Artist URL"
                                icon={<BeatportIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                            <InputRow
                                label="Bandcamp"
                                value={profileForm.bandcamp}
                                onChange={(v) => setProfileForm({ ...profileForm, bandcamp: v })}
                                placeholder="Bandcamp URL"
                                last
                                icon={<BandcampIcon className="w-5 h-5" />}
                                isEditing={isEditing}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
