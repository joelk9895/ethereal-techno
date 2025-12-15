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
    LayoutDashboard,
    User,
    FileText,
    ArrowUpRight,
    LogOut,
    LucideIcon
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

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

interface NavItemProps {
    id: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    onClick: () => void;
    external?: boolean;
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

// --- Animation Variants ---
const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
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
        <div className="flex h-screen bg-black text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                {/* --- RIGHT SIDEBAR (Navigation) --- */}
                <aside className="w-full lg:w-80 lg:h-full border-l border-white/10 bg-black/50 backdrop-blur-xl z-20 pt-24 pb-12 px-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
                    <div>
                        <div className="mb-12">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">My Account</div>
                            <h1 className="font-main text-3xl text-white uppercase leading-none break-words">
                                {user.name} <span className="text-white/30">{user.surname}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-mono text-primary uppercase tracking-widest">@{user.username}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{user.type}</span>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <NavItem
                                id="overview"
                                label="Overview"
                                icon={LayoutDashboard}
                                active={activeTab === "overview"}
                                onClick={() => handleNavigation("overview")}
                            />
                            <NavItem
                                id="profile"
                                label="Edit Profile"
                                icon={User}
                                active={activeTab === "profile"}
                                onClick={() => handleNavigation("profile")}
                            />
                            <NavItem
                                id="applications"
                                label="Applications"
                                icon={FileText}
                                active={activeTab === "applications"}
                                onClick={() => handleNavigation("applications")}
                            />

                            <div className="h-px bg-white/10 my-6" />

                            <NavItem
                                id="community"
                                label="Community Hub"
                                icon={ArrowUpRight}
                                active={false}
                                onClick={() => handleNavigation("community")}
                                external
                            />
                            <NavItem
                                id="shop"
                                label="Browse Shop"
                                icon={ArrowUpRight}
                                active={false}
                                onClick={() => handleNavigation("shop")}
                                external
                            />
                        </nav>
                    </div>

                    <div className="mt-12">
                        <button className="flex items-center gap-3 text-xs font-mono text-white/40 hover:text-red-400 transition-colors uppercase tracking-widest">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* --- LEFT CONTENT AREA --- */}
                <main className="flex-1 lg:overflow-y-auto pt-24 px-6 lg:px-20 pb-24 relative no-scrollbar">
                    <AnimatePresence mode="wait">

                        {/* 1. OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <motion.div
                                key="overview"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="max-w-4xl"
                            >
                                <h2 className="font-main text-6xl md:text-8xl uppercase text-white mb-2">Welcome</h2>
                                <p className="text-white/50 text-xl font-light mb-16">Your personal dashboard.</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-20">
                                    <StatBox label="Joined" value={Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + " Days"} />
                                    <StatBox label="Status" value="Active" highlight />
                                    <StatBox label="Applications" value={applications.length.toString()} />
                                </div>

                                <div className="border-t border-white/10 pt-12">
                                    <div className="flex items-center gap-4 mb-8">
                                        <AlertCircle className="w-6 h-6 text-white" />
                                        <h3 className="font-main text-3xl uppercase">Quick Actions</h3>
                                    </div>
                                    <div className="grid gap-4 max-w-md">
                                        {user.type === "USER" && applications.length === 0 && (
                                            <ActionButton
                                                label="Apply to Join Circle"
                                                href="/artist/apply"
                                                primary
                                                router={router}
                                            />
                                        )}
                                        <ActionButton
                                            label="Browse Shop"
                                            href="/shop"
                                            router={router}
                                        />
                                        <ActionButton
                                            label="Free Content"
                                            href="/free/content"
                                            router={router}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. PROFILE TAB */}
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="max-w-3xl"
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

                                {/* Mobile Action Buttons */}
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

                        {/* 3. APPLICATIONS TAB */}
                        {activeTab === "applications" && (
                            <motion.div
                                key="applications"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="max-w-4xl"
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
        </div>
    );
}

// --- Icons & Minimal Components ---
const Save: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
)

const NavItem: React.FC<NavItemProps> = ({ id, label, active, onClick, external }) => (
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
            <span className={`text-xs font-mono transition-colors ${active ? "text-primary" : "text-white/30 group-hover:text-white/60"}`}>
                {id === 'overview' ? '01' : id === 'profile' ? '02' : id === 'applications' ? '03' : '->'}
            </span>
            <span className={`text-sm font-medium uppercase tracking-wider transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                {label}
            </span>
        </div>
        {external && <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-primary" />}
    </button>
);

const StatBox: React.FC<StatBoxProps> = ({ label, value, highlight }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">{label}</span>
        <span className={`font-main text-4xl ${highlight ? "text-primary" : "text-white"}`}>{value}</span>
    </div>
);

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

const ActionButton: React.FC<ActionButtonProps> = ({ label, href, primary, router }) => (
    <button
        onClick={() => router.push(href)}
        className={`
            w-full flex items-center justify-between px-6 py-4 border transition-all duration-300 group
            ${primary
                ? "bg-white text-black border-white hover:bg-primary hover:border-primary"
                : "bg-transparent border-white/10 text-white hover:border-primary/50 hover:bg-white/[0.02]"
            }
        `}
    >
        <span className="font-bold uppercase tracking-wide text-xs">{label}</span>
        <ArrowRight className={`w-4 h-4 ${primary ? "text-black" : "text-white/40 group-hover:text-primary"} transition-colors`} />
    </button>
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