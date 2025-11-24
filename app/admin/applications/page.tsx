"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    LucideIcon
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";


interface Application {
    id: string;
    artistName: string;
    email: string;
    status: string;
    createdAt: string;
    user: {
        username: string;
        name: string;
    };
}

interface StatBlockProps {
    label: string;
    value: number;
    active?: boolean;
}

interface FilterPillProps {
    label: string;
    active: boolean;
    count?: number;
    onClick: () => void;
}

interface ApplicationRowProps {
    app: Application;
    router: ReturnType<typeof useRouter>;
}

interface StatusConfig {
    color: string;
    text: string;
    label: string;
    icon: LucideIcon;
}

// --- Animation Variants ---
const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVar = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function AdminApplicationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filterApplications = useCallback(() => {
        let filtered = applications;
        if (statusFilter !== "all") {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.artistName.toLowerCase().includes(query) ||
                    app.email.toLowerCase().includes(query)
            );
        }
        setFilteredApplications(filtered);
    }, [applications, statusFilter, searchQuery]);

    useEffect(() => {
        const authUser = getAuthUser();
        if (!authUser || authUser.type !== "ADMIN") {
            router.push("/dashboard");
            return;
        }
        fetchApplications();
    }, [router]);

    useEffect(() => {
        filterApplications();
    }, [filterApplications]);

    const fetchApplications = async () => {
        try {
            const response = await fetch("/api/admin/applications", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: applications.length,
        pending: applications.filter((app) => app.status === "PENDING").length,
        review: applications.filter((app) => app.status === "UNDER_REVIEW").length,
        approved: applications.filter((app) => app.status === "APPROVED").length,
    };

    if (loading) return <LoadingScreen />;

    return (
        <Layout>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
            
           

            <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
                
                {/* Header & HUD Stats */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h1 className="font-main text-6xl md:text-7xl uppercase leading-[0.85] mb-2">
                            Artist Requests
                        </h1>
                        <p className="text-white/40 font-light text-lg">Manage incoming producer applications.</p>
                    </div>
                    
                    {/* Minimal HUD Stats */}
                    <div className="flex gap-8 border-l border-white/10 pl-8">
                        <StatBlock label="Pending" value={stats.pending} active />
                        <StatBlock label="Reviewing" value={stats.review} />
                        <StatBlock label="Approved" value={stats.approved} />
                    </div>
                </div>

                {/* Controls Area */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
                    
                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                        <FilterPill label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                        <FilterPill label="Pending" active={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} count={stats.pending} />
                        <FilterPill label="Reviewing" active={statusFilter === 'UNDER_REVIEW'} onClick={() => setStatusFilter('UNDER_REVIEW')} />
                        <FilterPill label="Processed" active={['APPROVED', 'REJECTED'].includes(statusFilter)} onClick={() => setStatusFilter('APPROVED')} />
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find artist..."
                            className="bg-transparent border-b border-white/10 pl-8 pr-4 py-2 w-full font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Column Headers */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <div className="col-span-4">Artist Identity</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Submission Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {/* Content List */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={statusFilter + searchQuery}
                        variants={containerVar}
                        initial="hidden"
                        animate="show"
                        className="space-y-2"
                    >
                        {filteredApplications.length === 0 ? (
                            <div className="py-24 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                <p className="font-mono text-white/30 uppercase tracking-widest text-sm">No Applications Found</p>
                            </div>
                        ) : (
                            filteredApplications.map((app) => (
                                <ApplicationRow key={app.id} app={app} router={router} />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>

            </main>
        </div>
        </Layout>
    );
}

// --- Minimal Sub-Components ---

const StatBlock: React.FC<StatBlockProps> = ({ label, value, active }) => (
    <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">{label}</div>
        <div className={`font-main text-3xl ${active ? "text-primary" : "text-white"}`}>
            {value.toString().padStart(2, '0')}
        </div>
    </div>
);

const FilterPill: React.FC<FilterPillProps> = ({ label, active, count, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2
            ${active 
                ? "bg-white text-black" 
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }
        `}
    >
        {label}
        {count && count > 0 && (
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary" : "bg-white/30"}`} />
        )}
    </button>
);

const ApplicationRow: React.FC<ApplicationRowProps> = ({ app, router }) => {
    const statusConfig = getStatusStyle(app.status);
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div 
            variants={itemVar}
            onClick={() => router.push(`/admin/applications/${app.id}`)}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 bg-white/[0.02] border border-transparent hover:border-primary/20 hover:bg-white/[0.04] transition-all cursor-pointer items-center rounded-lg"
        >
            {/* Identity */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-main text-white border border-white/10 group-hover:border-primary/50 transition-colors text-lg">
                    {app.artistName.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-none mb-1 group-hover:text-primary transition-colors">{app.artistName}</h3>
                    <p className="text-[10px] font-mono text-white/40 uppercase">@{app.user.username}</p>
                </div>
            </div>

            {/* Contact */}
            <div className="col-span-12 md:col-span-3 text-sm text-white/60 truncate font-light">
                {app.email}
            </div>

            {/* Date */}
            <div className="col-span-6 md:col-span-2 text-xs font-mono text-white/40">
                {new Date(app.createdAt).toLocaleDateString()}
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig.text}`}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Action */}
            <div className="col-span-12 md:col-span-1 flex justify-end">
                <div className="p-2 rounded-full text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
};

// --- Helpers ---

const getStatusStyle = (status: string): StatusConfig => {
    switch (status) {
        case "APPROVED":
            return { color: "text-green-400", text: "text-green-400", label: "Approved", icon: CheckCircle };
        case "REJECTED":
            return { color: "text-red-400", text: "text-red-400", label: "Rejected", icon: XCircle };
        case "UNDER_REVIEW":
            return { color: "text-yellow-400", text: "text-yellow-400", label: "Reviewing", icon: AlertCircle };
        default:
            return { color: "text-blue-400", text: "text-blue-400", label: "Pending", icon: Clock };
    }
};

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-black flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
    </div>
);