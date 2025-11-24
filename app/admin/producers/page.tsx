"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Search,
    Clock,
    Globe,
    ShieldCheck,
    UserCheck,
    MoreHorizontal,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";

// --- Types ---
interface Producer {
    id: string;
    username: string;
    name: string;
    surname: string | null;
    email: string;
    country: string | null;
    type: string;
    approvedAt: string | null;
    canCreateSamples: boolean;
    canCreateSerum: boolean;
    canCreateDiva: boolean;
    createdAt: string;
    _count: { artistApplications: number };
    latestApplication?: { id: string; status: string; artistName: string };
}

interface StatBlockProps {
    label: string;
    value: number;
    active?: boolean;
    color?: string;
}

interface FilterPillProps {
    label: string;
    active: boolean;
    count?: number;
    onClick: () => void;
}

interface ProducerRowProps {
    producer: Producer;
    onToggle: (userId: string, field: string, currentValue: boolean) => void;
    router: ReturnType<typeof useRouter>;
}

interface PermissionToggleProps {
    active: boolean;
    label: string;
    onClick: () => void;
}

interface StatusBadge {
    style: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

// --- Animation Variants ---
const containerVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVar = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function ProducersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [producers, setProducers] = useState<Producer[]>([]);
    const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [countryFilter, setCountryFilter] = useState<string>("all");

    const filterProducers = useCallback(() => {
        let filtered = producers;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    (p.surname?.toLowerCase() || "").includes(query) ||
                    p.username.toLowerCase().includes(query) ||
                    p.email.toLowerCase().includes(query) ||
                    p.latestApplication?.artistName.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== "all") {
            if (statusFilter === "pending") filtered = filtered.filter((p) => p.latestApplication?.status === "PENDING");
            else if (statusFilter === "verified_producer") filtered = filtered.filter((p) => p.type === "ARTIST" && p.approvedAt);
            else if (statusFilter === "verified_contributor") filtered = filtered.filter((p) => p.type === "USER" && p.approvedAt);
        }
        if (countryFilter !== "all") {
            filtered = filtered.filter((p) => p.country === countryFilter);
        }
        setFilteredProducers(filtered);
    }, [producers, searchQuery, statusFilter, countryFilter]);

    useEffect(() => {
        const authUser = getAuthUser();
        if (!authUser || authUser.type !== "ADMIN") {
            router.push("/dashboard");
            return;
        }
        fetchProducers();
    }, [router]);

    useEffect(() => {
        filterProducers();
    }, [filterProducers]);

    const fetchProducers = async () => {
        try {
            const response = await fetch("/api/admin/producers", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setProducers(data.producers);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAbility = async (userId: string, field: string, currentValue: boolean) => {
        try {
            // Optimistic update
            setProducers(prev => prev.map(p => p.id === userId ? { ...p, [field]: !currentValue } : p));
            
            const response = await fetch(`/api/admin/producers/${userId}/abilities`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ [field]: !currentValue }),
            });
            if (!response.ok) throw new Error("Failed");
        } catch (error) {
            console.error("Error:", error);
            fetchProducers(); // Revert on error
        }
    };

    const uniqueCountries = Array.from(new Set(producers.map((p) => p.country).filter(Boolean))).sort();

    const stats = {
        total: producers.length,
        verifiedProducers: producers.filter((p) => p.type === "ARTIST" && p.approvedAt).length,
        verifiedContributors: producers.filter((p) => p.type === "USER" && p.approvedAt).length,
        pending: producers.filter((p) => p.latestApplication?.status === "PENDING").length,
    };

    if (loading) return <LoadingScreen />;

    return (
        <Layout>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
          
            <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
                
                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h1 className="font-main text-6xl md:text-7xl uppercase leading-[0.85] mb-2">
                            User Database
                        </h1>
                        <p className="text-white/40 font-light text-lg">Manage permissions and access.</p>
                    </div>
                    <div className="flex gap-8 border-l border-white/10 pl-8">
                        <StatBlock label="Total Users" value={stats.total} />
                        <StatBlock label="Producers" value={stats.verifiedProducers} active />
                        <StatBlock label="Contributors" value={stats.verifiedContributors} />
                        <StatBlock label="Pending" value={stats.pending} color="text-yellow-400" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
                    
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar">
                        <FilterPill label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                        <FilterPill label="Verified Producers" active={statusFilter === 'verified_producer'} onClick={() => setStatusFilter('verified_producer')} />
                        <FilterPill label="Contributors" active={statusFilter === 'verified_contributor'} onClick={() => setStatusFilter('verified_contributor')} />
                        <FilterPill label="Pending" active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} count={stats.pending} />
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64 group">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find user..."
                                className="bg-transparent border-b border-white/10 pl-8 pr-4 py-2 w-full font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Globe className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <select 
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                className="bg-transparent border-b border-white/10 pl-8 pr-8 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer min-w-[140px]"
                            >
                                <option value="all" className="bg-black">Global</option>
                                {uniqueCountries.map((c) => <option key={c} value={c!} className="bg-black">{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* List Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <div className="col-span-3">User Identity</div>
                    <div className="col-span-2">Location</div>
                    <div className="col-span-2">Role & Status</div>
                    <div className="col-span-2">Verified Date</div>
                    <div className="col-span-2">Permissions</div>
                    <div className="col-span-1 text-right"></div>
                </div>

                {/* Producer List */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={statusFilter + searchQuery + countryFilter}
                        variants={containerVar}
                        initial="hidden"
                        animate="show"
                        className="space-y-2"
                    >
                        {filteredProducers.length === 0 ? (
                            <div className="py-24 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                <p className="font-mono text-white/30 uppercase tracking-widest text-sm">No Users Found</p>
                            </div>
                        ) : (
                            filteredProducers.map((producer) => (
                                <ProducerRow 
                                    key={producer.id} 
                                    producer={producer} 
                                    onToggle={toggleAbility}
                                    router={router}
                                />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>

            </main>
        </div>
        </Layout>
    );
}

// --- Sub-Components ---

const StatBlock: React.FC<StatBlockProps> = ({ label, value, active, color }) => (
    <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">{label}</div>
        <div className={`font-main text-3xl ${color ? color : active ? "text-primary" : "text-white"}`}>
            {value.toString().padStart(2, '0')}
        </div>
    </div>
);

const FilterPill: React.FC<FilterPillProps> = ({ label, active, count, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap
            ${active 
                ? "bg-white text-black" 
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }
        `}
    >
        {label}
        {count && count > 0 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded bg-white/20 ${active ? "text-black" : "text-white"}`}>
                {count}
            </span>
        )}
    </button>
);

const ProducerRow: React.FC<ProducerRowProps> = ({ producer, onToggle, router }) => {
    const status = getStatusBadge(producer);

    return (
        <motion.div 
            variants={itemVar}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 bg-white/[0.02] border border-transparent hover:border-primary/20 hover:bg-white/[0.04] transition-all items-center rounded-lg"
        >
            {/* Identity */}
            <div className="col-span-12 md:col-span-3">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-main text-white border border-white/10 text-lg">
                        {(producer.latestApplication?.artistName || producer.name).charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-white text-sm leading-none mb-1 truncate">
                            {producer.latestApplication?.artistName || `${producer.name} ${producer.surname || ""}`}
                        </h3>
                        <p className="text-[10px] font-mono text-white/40 uppercase truncate">@{producer.username}</p>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-sm text-white/60">
                <Globe className="w-3 h-3 opacity-50" />
                <span className="truncate">{producer.country || "—"}</span>
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${status.style}`}>
                    <status.icon className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{status.label}</span>
                </div>
            </div>

            {/* Date */}
            <div className="col-span-6 md:col-span-2 text-xs font-mono text-white/40">
                {producer.approvedAt ? new Date(producer.approvedAt).toLocaleDateString() : "—"}
            </div>

            {/* Permissions */}
            <div className="col-span-12 md:col-span-2 flex gap-1">
                <PermissionToggle 
                    active={producer.canCreateSamples} 
                    label="SPL" 
                    onClick={() => onToggle(producer.id, "canCreateSamples", producer.canCreateSamples)} 
                />
                <PermissionToggle 
                    active={producer.canCreateSerum} 
                    label="SRM" 
                    onClick={() => onToggle(producer.id, "canCreateSerum", producer.canCreateSerum)} 
                />
                <PermissionToggle 
                    active={producer.canCreateDiva} 
                    label="DVA" 
                    onClick={() => onToggle(producer.id, "canCreateDiva", producer.canCreateDiva)} 
                />
            </div>

            {/* Action */}
            <div className="col-span-12 md:col-span-1 flex justify-end">
                {producer.latestApplication?.status === "PENDING" ? (
                    <button 
                        onClick={() => router.push(`/admin/applications/${producer.latestApplication?.id}`)}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors border-b border-primary/50 hover:border-white pb-0.5"
                    >
                        Review
                    </button>
                ) : (
                    <div className="p-2 rounded-full text-white/10 group-hover:text-white/30 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const PermissionToggle: React.FC<PermissionToggleProps> = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-8 h-6 flex items-center justify-center rounded text-[9px] font-bold transition-all border
            ${active 
                ? "bg-primary text-black border-primary" 
                : "bg-transparent text-white/20 border-white/10 hover:border-white/30 hover:text-white/50"
            }
        `}
        title={label}
    >
        {label}
    </button>
);

// --- Helpers ---

const getStatusBadge = (producer: Producer): StatusBadge => {
    if (producer.latestApplication?.status === "PENDING") {
        return { style: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400", label: "Pending", icon: Clock };
    } else if (producer.type === "ARTIST" && producer.approvedAt) {
        return { style: "bg-green-500/10 border-green-500/20 text-green-400", label: "Verified", icon: ShieldCheck };
    } else if (producer.approvedAt) {
        return { style: "bg-blue-500/10 border-blue-500/20 text-blue-400", label: "Contributor", icon: UserCheck };
    }
    return { style: "bg-white/5 border-white/10 text-white/40", label: "User", icon: UserCheck };
};

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-black flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
    </div>
);