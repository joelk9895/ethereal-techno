"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Mail,
    Globe,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowRight,
    User,
    History as HistoryIcon,
    Download
} from "lucide-react";
import Image from "next/image";
import RightSidebar from "@/app/components/RightSidebar";
import MarketplaceHome from "@/app/dashboard/components/MarketplaceHome";
import { getAuthUser, logout } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data for Library
const mockLibraryItems = [
    { id: 1, title: "Ethereal Echoes", artist: "Lunar Systems", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&fit=crop", type: "Sample Loop", size: "1.2 GB", format: "WAV" },
    { id: 2, title: "Midnight Frequencies", artist: "Voidwalker", image: "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?q=80&w=600&fit=crop", type: "Preset", size: "45 MB", format: "FXP" },
    { id: 3, title: "Synthetic Dreams", artist: "Analog Soul", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&fit=crop", type: "Construction Kit", size: "850 MB", format: "WAV" },
    { id: 4, title: "Deep Space Signals", artist: "Nebula", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&fit=crop", type: "MIDI", size: "15 KB", format: "MID" },
    { id: 5, title: "Glitch Patterns", artist: "Err0r", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&fit=crop", type: "One-Shot", size: "320 MB", format: "WAV" },
    { id: 6, title: "Ambient Works Vol. 1", artist: "Cloud 9", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600&fit=crop", type: "Sample Loop", size: "2.1 GB", format: "WAV" },
    { id: 7, title: "Bass Theory", artist: "Low Frequency", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&fit=crop", type: "Preset", size: "12 MB", format: "FXP" },
    { id: 8, title: "Industrial Noise", artist: "Factory", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&fit=crop", type: "Sample Loop+MIDI", size: "640 MB", format: "WAV" },
];

interface LibraryItem {
    id: number;
    title: string;
    artist: string;
    image: string;
    type: string;
    size: string;
    format: string;
}

const LibraryCard = ({ item }: { item: LibraryItem }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1E1E1E] mb-4 border border-white/5 shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300">
            {/* Format Badge */}
            <div className="absolute top-3 left-3 z-20 flex gap-2">
                <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.format}
                </div>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                    <Download className="w-3.5 h-3.5" />
                    Download
                </button>
                <span className="text-white/60 text-xs font-mono uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                    {item.size}
                </span>
            </div>
            <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
        </div>
        <div>
            <h3 className="text-white font-bold text-base truncate mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
            <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider truncate">{item.artist}</p>
                <p className="hidden md:block text-white/20 text-[10px] font-mono uppercase tracking-widest">{item.type}</p>
            </div>
        </div>
    </div>
);

interface UserData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string | null;
    type: string;
    country: string | null;
    createdAt: string;
    approvedAt: string | null;
}

interface Application {
    id: string;
    artistName: string;
    status: string;
    createdAt: string;
    reviewNotes: string | null;
    reviewedAt: string | null;
}

interface ActionButtonProps {
    label: string;
    href: string;
    primary?: boolean;
    router: ReturnType<typeof useRouter>;
}

interface ApplicationRowProps {
    app: Application;
}



interface StatBoxProps {
    label: string;
    value: string;
    highlight?: boolean;
}

interface ProfileFieldProps {
    label: string;
    value: string | null | undefined;
    editing?: boolean;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    isSelect?: boolean;
    options?: string[];
}

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("home");
    const [user, setUser] = useState<UserData | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        country: "",
    });

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

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch("/api/user/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setFormData({
                    name: data.user.name || "",
                    surname: data.user.surname || "",
                    country: data.user.country || "",
                });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            router.push("/signin");
        }
    }, [router]);

    const fetchApplications = useCallback(async () => {
        try {
            const response = await fetch("/api/artist/apply", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.exists && data.application) {
                    setApplications([data.application]);
                } else {
                    setApplications([]);
                }
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        }
    }, []);

    useEffect(() => {
        const authUser = getAuthUser();
        if (!authUser) {
            router.push("/signin");
            return;
        }

        switch (authUser.type) {
            case "ADMIN":
                router.push("/admin");
                break;
            case "ARTIST":
                router.push("/dashboard/producer");
                break;
            case "USER":
            default:
                break;
        }

        fetchUserData();
        fetchApplications();
        setLoading(false);
    }, [router, fetchUserData, fetchApplications]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setEditing(false);
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({
                    ...storedUser,
                    name: data.user.name,
                    surname: data.user.surname,
                    country: data.user.country,
                }));
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || "",
            surname: user?.surname || "",
            country: user?.country || "",
        });
        setEditing(false);
    };

    const handleNavigation = (id: string) => {
        if (id === "community") {
            router.push("/community");
            return;
        }
        if (id === "shop") {
            router.push("/shop");
            return;
        }
        setActiveTab(id);
    };

    const handleSignOut = useCallback(() => {
        logout();
        router.push("/signin");
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono tracking-widest text-white/50">LOADING PROFILE...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-background text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">

            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                <RightSidebar
                    user={user}
                    activeTab={activeTab}
                    onNavigate={handleNavigation}
                    onSignOut={handleSignOut}
                />

                <main className="flex-1 lg:overflow-y-auto pt-24 px-6 lg:px-8 pb-24 relative no-scrollbar">
                    <AnimatePresence mode="wait">

                        {activeTab === "home" && (
                            <div className="w-full">
                                <MarketplaceHome />
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-none"
                            >
                                <div className="flex items-end justify-between mb-12">
                                    <div>
                                        <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">Profile</h2>
                                        <p className="text-white/50 text-lg font-light">Update your personal details.</p>
                                    </div>
                                    {!editing ? (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            Edit Details
                                        </button>
                                    ) : (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleCancel}
                                                className="hidden md:flex items-center gap-2 text-white/50 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="hidden md:flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileField
                                            label="First Name"
                                            value={formData.name}
                                            editing={editing}
                                            onChange={(v) => setFormData({ ...formData, name: v! })}
                                        />
                                        <ProfileField
                                            label="Last Name"
                                            value={formData.surname}
                                            editing={editing}
                                            onChange={(v) => setFormData({ ...formData, surname: v! })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileField
                                            label="Email Address"
                                            value={user.email}
                                            readOnly
                                            icon={Mail}
                                        />
                                        <ProfileField
                                            label="Country / Region"
                                            value={formData.country}
                                            editing={editing}
                                            onChange={(v) => setFormData({ ...formData, country: v! })}
                                            isSelect
                                            options={countries}
                                        />
                                    </div>
                                </div>

                                {editing && (
                                    <div className="grid grid-cols-2 gap-4 mt-8 md:hidden">
                                        <button
                                            onClick={handleCancel}
                                            className="w-full flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full flex items-center justify-center gap-2 bg-primary text-black px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                )}
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="md:hidden w-full mt-8 flex items-center justify-center gap-2 bg-white text-black px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                )}

                            </motion.div>
                        )}





                        {activeTab === "library" && (
                            <motion.div
                                key="library"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-none"
                            >
                                <div className="space-y-6">
                                    <h2 className="font-main text-4xl md:text-5xl font-bold text-white">Library</h2>

                                    {/* Filters */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                        {["All", "One-Shot", "Sample Loop", "Sample Loop+MIDI", "MIDI", "Preset", "Construction Kit"].map((filter, i) => (
                                            <button
                                                key={filter}
                                                className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${i === 0 ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:text-white hover:border-white/40'}`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>

                                    <hr className="border-white/5" />

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {mockLibraryItems.map((item) => (
                                            <LibraryCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div
                                key="orders"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-none"
                            >
                                <div className="flex items-end justify-between mb-12">
                                    <div>
                                        <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">Order History</h2>
                                        <p className="text-white/50 text-lg font-light">View your past transactions.</p>
                                    </div>
                                </div>
                                <div className="bg-[#1E1E1E] rounded-3xl p-12 border border-white/5 text-center flex flex-col items-center justify-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                        <HistoryIcon className="w-8 h-8 text-white/20" />
                                    </div>
                                    <div className="max-w-md space-y-2">
                                        <h3 className="text-xl text-white font-medium uppercase tracking-wide">No past orders</h3>
                                        <p className="text-white/40 text-sm font-light leading-relaxed">
                                            Your transaction history will appear here once you make a purchase.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "applications" && (
                            <motion.div
                                key="applications"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-none"
                            >
                                <div className="flex items-end justify-between mb-12">
                                    <div>
                                        <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">Applications</h2>
                                        <p className="text-white/50 text-lg font-light">Status of your requests.</p>
                                    </div>
                                    {user.type === "USER" && (
                                        <button
                                            onClick={() => router.push("/artist/apply")}
                                            className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors"
                                        >
                                            New Application
                                        </button>
                                    )}
                                </div>

                                {applications.length === 0 ? (
                                    <div className="py-20 border-y border-white/10 text-center">
                                        <p className="font-mono text-white/40 uppercase tracking-widest mb-6">No applications found</p>
                                        <button
                                            onClick={() => router.push("/artist/apply")}
                                            className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                                        >
                                            Apply Now <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map((app) => (
                                            <ApplicationRow key={app.id} app={app} />
                                        ))}
                                    </div>
                                )}


                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
            </div>
        </div >
    );
}

const Save: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
)

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, editing, onChange, readOnly, icon: Icon, isSelect, options }) => (
    <div className="group">
        <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">
            {Icon && <Icon className="w-3 h-3" />}
            {label}
        </label>

        {editing && !readOnly ? (
            isSelect ? (
                <div className="relative">
                    <select
                        value={value || ""}
                        onChange={(e) => onChange?.(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 py-2 text-lg font-light text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-black">Select Country</option>
                        {options?.map((option) => (
                            <option key={option} value={option} className="bg-black">{option}</option>
                        ))}
                    </select>
                    <Globe className="absolute right-0 top-2 w-4 h-4 text-white/20 pointer-events-none" />
                </div>
            ) : (
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-lg font-light text-white focus:outline-none focus:border-primary transition-colors"
                />
            )
        ) : (
            <div className={`text-xl ${readOnly ? "text-white/50" : "text-white"}`}>
                {value || "—"}
            </div>
        )}
    </div>
);

const ApplicationRow: React.FC<ApplicationRowProps> = ({ app }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "APPROVED": return { color: "text-green-400", icon: CheckCircle, label: "Approved" };
            case "REJECTED": return { color: "text-red-400", icon: AlertCircle, label: "Declined" };
            case "UNDER_REVIEW": return { color: "text-yellow-400", icon: AlertCircle, label: "Reviewing" };
            default: return { color: "text-blue-400", icon: Clock, label: "Pending" };
        }
    };

    const status = getStatusConfig(app.status);
    const StatusIcon = status.icon;

    return (
        <div className="border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-main text-xl uppercase">{app.artistName}</h4>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{status.label}</span>
                </div>
            </div>
            <p className="text-xs font-mono text-white/40 mb-4">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>

            {app.reviewNotes && (
                <div className="p-4 bg-black/40 border-l-2 border-white/20 text-sm text-white/70">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Admin Feedback:</p>
                    &ldquo;{app.reviewNotes}&rdquo;
                </div>
            )}
        </div>
    );
};