"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Globe, User } from "lucide-react";
import { useUserDashboard } from "../UserLayoutClient";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

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

const ProfileField = ({ label, value, editing, onChange, readOnly, icon: Icon, isSelect, options }: ProfileFieldProps) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</label>
        {editing && !readOnly ? (
            isSelect ? (
                <div className="relative border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                    {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />}
                    <select
                        value={value || ""}
                        onChange={(e) => onChange?.(e.target.value)}
                        className={`w-full bg-transparent text-white font-medium focus:outline-none appearance-none ${Icon ? 'pl-8' : ''}`}
                    >
                        <option value="" disabled className="bg-neutral-900 text-white/50">Select country</option>
                        {options?.map(opt => <option key={opt} value={opt} className="bg-neutral-900 text-white">{opt}</option>)}
                    </select>
                </div>
            ) : (
                <div className="relative border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                    {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />}
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange?.(e.target.value)}
                        className={`w-full bg-transparent text-white font-medium placeholder:text-white/20 focus:outline-none ${Icon ? 'pl-8' : ''}`}
                    />
                </div>
            )
        ) : (
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-4 h-4 text-white/40" />}
                <p className="text-white text-lg font-medium tracking-wide">
                    {value || <span className="text-white/20 italic text-sm font-light">Not provided</span>}
                </p>
            </div>
        )}
    </div>
);

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

export default function DashboardProfilePage() {
    const router = useRouter();
    const { user, setUser } = useUserDashboard();
    
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        country: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                surname: user.surname || "",
                country: user.country || "",
            });
        }
    }, [user]);

    if (!user) return null;

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

    return (
        <motion.div
            key="profile"
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            className="w-full max-w-none"
        >
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">My Profile</h2>
                    <p className="text-white/50 text-lg font-light">Manage your personal information and preferences.</p>
                </div>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="hidden md:flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Edit Details
                    </button>
                ) : (
                    <div className="hidden md:flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 rounded-full border border-white/20 text-white/60 px-6 py-2.5 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:border-white/40 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 bg-white text-black px-8 py-2.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-[#1C1C1C] rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 relative z-10">
                    <ProfileField
                        label="First Name"
                        value={formData.name}
                        editing={editing}
                        onChange={(v) => setFormData({ ...formData, name: v })}
                        icon={User}
                    />
                    <ProfileField
                        label="Last Name"
                        value={formData.surname}
                        editing={editing}
                        onChange={(v) => setFormData({ ...formData, surname: v })}
                        icon={User}
                    />
                    <ProfileField
                        label="Email Address"
                        value={user.email}
                        editing={editing}
                        readOnly
                        icon={Mail}
                    />
                    <ProfileField
                        label="Username"
                        value={`@${user.username}`}
                        editing={editing}
                        readOnly
                    />
                    <div className="md:col-span-2">
                        <ProfileField
                            label="Country / Region"
                            value={formData.country}
                            editing={editing}
                            onChange={(v) => setFormData({ ...formData, country: v })}
                            icon={Globe}
                            isSelect
                            options={countries}
                        />
                    </div>
                </div>

                {editing && (
                    <div className="grid grid-cols-2 gap-4 mt-8 md:hidden">
                        <button
                            onClick={handleCancel}
                            className="w-full flex items-center justify-center gap-2 rounded-full border border-white/20 text-white/60 px-6 py-3 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:border-white/40 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="md:hidden w-full mt-8 flex items-center justify-center gap-2 bg-primary text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Edit Details
                    </button>
                )}

                {/* Delete Account Section */}
                <div className="mt-16 pt-12 border-t border-red-500/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="font-main text-2xl uppercase text-red-400 mb-2">Delete Account</h3>
                            <p className="text-white/40 text-sm font-light max-w-md">
                                Permanently delete your Ethereal Techno account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all access.")) return;
                                setDeletingAccount(true);
                                try {
                                    const res = await fetch("/api/user", {
                                        method: "DELETE",
                                        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                                    });
                                    if (res.ok) {
                                        logout();
                                        router.push("/");
                                    } else {
                                        const data = await res.json();
                                        alert(data.error || "Failed to delete account.");
                                    }
                                } catch (err) {
                                    console.error("Delete account error:", err);
                                    alert("Something went wrong. Please try again.");
                                } finally {
                                    setDeletingAccount(false);
                                }
                            }}
                            disabled={deletingAccount}
                            className="self-start md:self-auto px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            {deletingAccount ? "Deleting..." : "Delete Account"}
                        </button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
