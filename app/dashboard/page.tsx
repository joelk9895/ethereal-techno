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
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

// --- Types ---
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

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export default function DashboardPage() {
    const router = useRouter();
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
                setApplications(data.applications || []);
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

        // Redirect based on user type
        switch (authUser.type) {
            case "ADMIN":
                router.push("/admin");
                break;
            case "ARTIST":
                router.push("/dashboard/producer");
                break;
            case "USER":
            default:
                // Continue to load profile
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

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-xs font-mono tracking-widest text-white/50">LOADING PROFILE...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) return null;

    return (
        <Layout>
            <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black relative overflow-hidden">

                {/* Background Effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/5 blur-[150px] rounded-full" />
                </div>

                <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-16"
                    >

                        {/* LEFT COLUMN: Identity & Edit */}
                        <div className="lg:col-span-8">
                            <motion.div className="mb-16">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-main text-white">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="font-main text-5xl md:text-7xl uppercase leading-[0.9] mb-2">
                                            {user.name} <span className="text-white/30">{user.surname}</span>
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-primary uppercase tracking-widest">
                                                @{user.username}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                                                {user.type.replace('_', ' ')} Account
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex items-center gap-4 border-b border-white/10 pb-8 mb-8">
                                    {!editing ? (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                                        >
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                                            >
                                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Save</span>}
                                                <span>Save Changes</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center gap-2 px-6 py-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Profile Fields */}
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileField
                                            label="First Name"
                                            value={formData.name}
                                            editing={editing}
                                            onChange={(v: string) => setFormData({ ...formData, name: v })}
                                        />
                                        <ProfileField
                                            label="Last Name"
                                            value={formData.surname}
                                            editing={editing}
                                            onChange={(v: string) => setFormData({ ...formData, surname: v })}
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
                                            onChange={(v: string) => setFormData({ ...formData, country: v })}
                                            isSelect
                                            options={countries}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Applications Section */}
                            {applications.length > 0 && (
                                <div className="pt-12 border-t border-white/10">
                                    <h3 className="font-mono text-sm text-white/40 uppercase tracking-widest mb-8">Application History</h3>
                                    <div className="space-y-4">
                                        {applications.map((app) => (
                                            <ApplicationRow key={app.id} app={app} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Status & Actions */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Account Info */}
                            <div className="p-8 border border-white/10 bg-white/[0.02]">
                                <h3 className="font-main text-2xl uppercase mb-6">Account Info</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Status</span>
                                        <span className="text-sm font-medium text-primary">Active</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Joined</span>
                                        <span className="text-sm font-medium text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {user.approvedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Verified</span>
                                            <span className="text-sm font-medium text-green-400">{new Date(user.approvedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h3 className="font-mono text-xs text-white/40 uppercase tracking-widest mb-4">Quick Actions</h3>
                                <div className="space-y-3">
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
                                        label="Community"
                                        href="/community"
                                        router={router}
                                    />
                                    <ActionButton
                                        label="Free Content"
                                        href="/free/content"
                                        router={router}
                                    />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </main>
            </div>
        </Layout>
    );
}

// Sub-components
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