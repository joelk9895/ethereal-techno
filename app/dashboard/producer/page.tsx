"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Loader2,
    ShieldCheck,
    Save,
    User,
    Camera,
    ArrowUpRight,
    LayoutDashboard,
    CreditCard,
    ShoppingBag,
    LogOut,
    LucideIcon
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

// --- Interfaces ---
interface ProducerData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    artistName: string;
    artistPhoto: string | null;
    city: string | null;
    country: string | null;
    quote: string | null;
    instagram: string | null;
    tiktok: string | null;
    facebook: string | null;
    youtube: string | null;
    x: string | null;
    linktree: string | null;
    spotify: string | null;
    soundcloud: string | null;
    beatport: string | null;
    bandcamp: string | null;
    appleMusic: string | null;
    publicEmail: boolean;
    canCreateSamples: boolean;
    canCreateSerum: boolean;
    canCreateDiva: boolean;
    telegramJoined: boolean;
    createdAt: string;
    approvedAt: string;
    billing?: {
        fullName: string;
        addressLine1: string;
        addressLine2: string;
        postalCode: string;
        city: string;
        country: string;
        companyName: string;
        vatId: string;
    };
}

interface Order {
    id: string;
    date: string;
    product: string;
    amount: number;
    downloadUrl: string | null;
}

interface ProfileFormData {
    artistName?: string;
    city?: string | null;
    country?: string | null;
    quote?: string | null;
    instagram?: string | null;
    soundcloud?: string | null;
    spotify?: string | null;
}

interface BillingFormData {
    fullName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    vatId?: string;
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

interface InputGroupProps {
    label: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
    type?: string;
    multiline?: boolean;
    placeholder?: string;
}

// --- Animation Variants ---
const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function ProducerDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [producer, setProducer] = useState<ProducerData | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState<ProfileFormData>({});
    const [billingForm, setBillingForm] = useState<BillingFormData>({});

    useEffect(() => {
        const user = getAuthUser();
        if (!user || (user.type !== "ARTIST" && user.type !== "ADMIN")) {
            router.push("/dashboard");
            return;
        }
        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            // Fetch Profile
            const profileRes = await fetch("/api/producer/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (profileRes.ok) {
                const data = await profileRes.json();
                setProducer(data.producer);
                setProfileForm(data.producer);
                setBillingForm(data.producer.billing || {});
            }

            // Fetch Orders
            const ordersRes = await fetch("/api/producer/orders", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (id: string) => {
        if (id === "free-content") {
            router.push("/free/content");
            return;
        }
        if (id === "community") {
            router.push("/community");
            return;
        }
        setActiveTab(id);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/producer/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(profileForm),
            });
            if (res.ok) {
                const data = await res.json();
                setProducer(data.producer);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBilling = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/producer/billing", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(billingForm),
            });
            if (res.ok) {
                // Success
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("photo", file);

        try {
            const res = await fetch("/api/producer/upload-photo", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                setProducer(prev => prev ? { ...prev, artistPhoto: data.photoUrl } : null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono tracking-widest text-white/50">LOADING DASHBOARD...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black relative">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">

                {/* --- LEFT SIDEBAR (Navigation) --- */}
                <aside className="w-full lg:w-80 lg:fixed lg:h-screen border-r border-white/10 bg-black/50 backdrop-blur-xl z-20 pt-24 pb-12 px-8 flex flex-col justify-between">
                    <div>
                        <div className="mb-12">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Artist Dashboard</div>
                            <h1 className="font-main text-3xl text-white uppercase leading-none">
                                {producer?.artistName || producer?.name}
                            </h1>
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
                                label="Profile & Socials"
                                icon={User}
                                active={activeTab === "profile"}
                                onClick={() => handleNavigation("profile")}
                            />
                            <NavItem
                                id="billing"
                                label="Billing Details"
                                icon={CreditCard}
                                active={activeTab === "billing"}
                                onClick={() => handleNavigation("billing")}
                            />
                            <NavItem
                                id="orders"
                                label="Order History"
                                icon={ShoppingBag}
                                active={activeTab === "orders"}
                                onClick={() => handleNavigation("orders")}
                            />

                            <div className="h-px bg-white/10 my-6" />

                            <NavItem
                                id="free-content"
                                label="Free Packs Zone"
                                icon={ArrowUpRight}
                                active={false}
                                onClick={() => handleNavigation("free-content")}
                                external
                            />
                            <NavItem
                                id="community"
                                label="Community Hub"
                                icon={ArrowUpRight}
                                active={false}
                                onClick={() => handleNavigation("community")}
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

                {/* --- RIGHT CONTENT AREA --- */}
                <main className="flex-1 lg:ml-80 pt-24 px-6 lg:px-20 pb-24 min-h-screen">
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
                                <h2 className="font-main text-6xl md:text-8xl uppercase text-white mb-2">Overview</h2>
                                <p className="text-white/50 text-xl font-light mb-16">Your production snapshot.</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                                    <StatBox label="Days in Circle" value={Math.floor((Date.now() - new Date(producer?.approvedAt || "").getTime()) / (1000 * 60 * 60 * 24)).toString()} />
                                    <StatBox label="Total Orders" value={orders.length.toString()} />
                                    <StatBox label="Verification" value="Active" highlight />
                                    <StatBox label="Discount" value="20%" />
                                </div>

                                <div className="border-t border-white/10 pt-12">
                                    <div className="flex items-center gap-4 mb-8">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                        <h3 className="font-main text-3xl uppercase">Account Status</h3>
                                    </div>
                                    <p className="text-white/60 max-w-2xl leading-relaxed">
                                        You are a verified member of the Ethereal Techno circle. This grants you access to exclusive downloads, community channels, and a permanent 20% discount on the store.
                                    </p>
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
                                        <p className="text-white/50 text-lg font-light">Manage your public artist persona.</p>
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>

                                <div className="space-y-16">
                                    {/* Photo Section */}
                                    <section className="flex items-start gap-8">
                                        <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center overflow-hidden relative group">
                                            {producer?.artistPhoto ? (
                                                <Image src={producer.artistPhoto} alt="Profile" fill className="object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-white/20" />
                                            )}
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Camera className="w-6 h-6 text-white" />
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>
                                        <div className="pt-4">
                                            <h3 className="text-white font-bold uppercase tracking-wide mb-1">Artist Photo</h3>
                                            <p className="text-white/40 text-sm mb-4">Recommended 500x500px. Max 5MB.</p>
                                            <label className="text-xs font-mono uppercase tracking-widest text-primary cursor-pointer hover:underline">
                                                Upload New
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>
                                    </section>

                                    {/* Form Fields */}
                                    <div className="grid gap-12">
                                        <InputGroup label="Artist Name" value={profileForm.artistName} onChange={(v) => setProfileForm({ ...profileForm, artistName: v })} />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <InputGroup label="City" value={profileForm.city} onChange={(v) => setProfileForm({ ...profileForm, city: v })} />
                                            <InputGroup label="Country" value={profileForm.country} onChange={(v) => setProfileForm({ ...profileForm, country: v })} />
                                        </div>

                                        <InputGroup label="Quote / Bio" value={profileForm.quote} onChange={(v) => setProfileForm({ ...profileForm, quote: v })} multiline />

                                        <div className="pt-8 border-t border-white/10">
                                            <h3 className="font-main text-2xl uppercase mb-8">Social Links</h3>
                                            <div className="grid gap-6">
                                                <InputGroup label="Instagram" value={profileForm.instagram} onChange={(v) => setProfileForm({ ...profileForm, instagram: v })} placeholder="https://instagram.com/..." />
                                                <InputGroup label="SoundCloud" value={profileForm.soundcloud} onChange={(v) => setProfileForm({ ...profileForm, soundcloud: v })} placeholder="https://soundcloud.com/..." />
                                                <InputGroup label="Spotify" value={profileForm.spotify} onChange={(v) => setProfileForm({ ...profileForm, spotify: v })} placeholder="Spotify Artist URL" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Save Button */}
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="md:hidden w-full mt-12 flex items-center justify-center gap-2 bg-white text-black px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </motion.div>
                        )}

                        {/* 3. BILLING TAB */}
                        {activeTab === "billing" && (
                            <motion.div
                                key="billing"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="max-w-3xl"
                            >
                                <div className="flex items-end justify-between mb-12">
                                    <div>
                                        <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">Billing</h2>
                                        <p className="text-white/50 text-lg font-light">Private details for invoices.</p>
                                    </div>
                                    <button
                                        onClick={handleSaveBilling}
                                        disabled={saving}
                                        className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>

                                <div className="space-y-12">
                                    <InputGroup label="Full Legal Name" value={billingForm.fullName} onChange={(v) => setBillingForm({ ...billingForm, fullName: v })} />
                                    <InputGroup label="Address Line 1" value={billingForm.addressLine1} onChange={(v) => setBillingForm({ ...billingForm, addressLine1: v })} />
                                    <InputGroup label="Address Line 2" value={billingForm.addressLine2} onChange={(v) => setBillingForm({ ...billingForm, addressLine2: v })} />

                                    <div className="grid grid-cols-2 gap-8">
                                        <InputGroup label="City" value={billingForm.city} onChange={(v) => setBillingForm({ ...billingForm, city: v })} />
                                        <InputGroup label="Postal Code" value={billingForm.postalCode} onChange={(v) => setBillingForm({ ...billingForm, postalCode: v })} />
                                    </div>

                                    <InputGroup label="VAT / Tax ID (Optional)" value={billingForm.vatId} onChange={(v) => setBillingForm({ ...billingForm, vatId: v })} />
                                </div>

                                <button
                                    onClick={handleSaveBilling}
                                    disabled={saving}
                                    className="md:hidden w-full mt-12 flex items-center justify-center gap-2 bg-white text-black px-6 py-4 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </motion.div>
                        )}

                        {/* 4. ORDERS TAB */}
                        {activeTab === "orders" && (
                            <motion.div
                                key="orders"
                                variants={fadeVar}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="max-w-4xl"
                            >
                                <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-12">History</h2>

                                {orders.length === 0 ? (
                                    <div className="py-20 border-y border-white/10 text-center">
                                        <p className="font-mono text-white/40 uppercase tracking-widest">No orders found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-0">
                                        {/* Header */}
                                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/40">
                                            <div className="col-span-3">Date</div>
                                            <div className="col-span-5">Product</div>
                                            <div className="col-span-2">Amount</div>
                                            <div className="col-span-2 text-right">Invoice</div>
                                        </div>

                                        {/* Rows */}
                                        {orders.map((order) => (
                                            <div key={order.id} className="grid grid-cols-12 gap-4 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center group">
                                                <div className="col-span-3 font-mono text-sm text-white/60">
                                                    {new Date(order.date).toLocaleDateString()}
                                                </div>
                                                <div className="col-span-5 font-medium text-white group-hover:text-primary transition-colors">
                                                    {order.product}
                                                </div>
                                                <div className="col-span-2 font-mono text-sm text-white/60">
                                                    ${order.amount.toFixed(2)}
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    {order.downloadUrl ? (
                                                        <a href={order.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest border-b border-white/20 hover:border-primary hover:text-primary pb-0.5 transition-colors">
                                                            Download
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-white/20">—</span>
                                                    )}
                                                </div>
                                            </div>
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

// --- Minimal Components ---

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
                {id === 'overview' ? '01' : id === 'profile' ? '02' : id === 'billing' ? '03' : id === 'orders' ? '04' : '->'}
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

const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, type = "text", multiline, placeholder }) => (
    <div className="group">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-primary transition-colors">
            {label}
        </label>
        {multiline ? (
            <textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                placeholder={placeholder}
                className="w-full bg-transparent border-b border-white/20 py-4 text-lg text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/10 resize-none"
            />
        ) : (
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent border-b border-white/20 py-4 text-lg text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/10"
            />
        )}
    </div>
);