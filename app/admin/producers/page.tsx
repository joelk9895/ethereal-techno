"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";
import {
    Search,
    Clock,
    Globe,
    ShieldCheck,
    UserCheck,
    MoreHorizontal,
    UserMinus,
    AlertTriangle,
    CheckCircle,
    Loader2,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Producer {
    id: string;
    username: string;
    name: string;
    surname: string | null;
    email: string;
    artistName: string | null;
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

// --- Animation Variants ---
const containerVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVar = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ProducersPage() {
    const router = useRouter();
    const [producers, setProducers] = useState<Producer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [countryFilter, setCountryFilter] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [dismissTarget, setDismissTarget] = useState<Producer | null>(null);
    const [dismissing, setDismissing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Derive filtered list directly — no extra state, no extra render cycle
    const filteredProducers = (() => {
        let filtered = producers;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    (p.surname?.toLowerCase() || "").includes(query) ||
                    p.username.toLowerCase().includes(query) ||
                    p.email.toLowerCase().includes(query) ||
                    (p.artistName?.toLowerCase() || "").includes(query) ||
                    (p.latestApplication?.artistName?.toLowerCase() || "").includes(query)
            );
        }
        if (countryFilter !== "all") {
            filtered = filtered.filter((p) => p.country === countryFilter);
        }
        return filtered;
    })();

    useEffect(() => {
        fetchProducers();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchProducers = async () => {
        try {
            const response = await authenticatedFetch("/api/admin/producers");
            if (response.ok) {
                const data = await response.json();
                setProducers(data.producers || []);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismissProducer = async () => {
        if (!dismissTarget) return;
        setDismissing(true);
        try {
            const response = await authenticatedFetch(`/api/admin/producers/${dismissTarget.id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "dismiss" }),
            });

            const data = await response.json();

            if (response.ok) {
                setProducers((prev) => prev.filter((p) => p.id !== dismissTarget.id));
                setToast({ message: data.message || "Producer dismissed successfully.", type: "success" });
            } else {
                setToast({ message: data.error || "Failed to dismiss producer.", type: "error" });
            }
        } catch {
            setToast({ message: "Network error. Please try again.", type: "error" });
        } finally {
            setDismissing(false);
            setDismissTarget(null);
        }
    };

    const uniqueCountries = Array.from(new Set(producers.map((p) => p.country).filter(Boolean))).sort();

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-12 pt-8">
                <h1 className="font-main text-6xl md:text-8xl uppercase leading-[0.9] mb-3">
                    Verified <span className="text-primary">Producers</span>
                </h1>
                <p className="text-white/50 text-lg font-light">
                    {producers.length} active producer{producers.length !== 1 ? "s" : ""} in the Circle.
                    Manage permissions and revoke producer access.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
                <div className="relative flex-1 w-full lg:w-auto group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or artist name..."
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
                        <option value="all" className="bg-black">All Countries</option>
                        {uniqueCountries.map((c) => (
                            <option key={c} value={c!} className="bg-black">{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <div className="col-span-3">Producer</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Country</div>
                <div className="col-span-2">Verified Since</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Producer List */}
            <div className="space-y-2">
                {filteredProducers.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                        <p className="font-mono text-white/30 uppercase tracking-widest text-sm">No producers found</p>
                    </div>
                ) : (
                    filteredProducers.map((producer) => (
                        <ProducerRow
                            key={producer.id}
                            producer={producer}
                            onDismiss={setDismissTarget}
                            router={router}
                        />
                    ))
                )}
            </div>

            {/* Dismiss Confirmation Modal */}
            <AnimatePresence>
                {dismissTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => !dismissing && setDismissTarget(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="font-main text-2xl uppercase text-white">Dismiss Producer</h3>
                                    <p className="text-white/40 text-sm">Revoke verified producer status.</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                                        {(dismissTarget.latestApplication?.artistName || dismissTarget.name).charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">
                                            {dismissTarget.latestApplication?.artistName || dismissTarget.name}
                                        </div>
                                        <div className="text-white/40 text-xs font-mono">@{dismissTarget.username}</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-white/60 text-sm mb-8 leading-relaxed">
                                This will demote <strong className="text-white">{dismissTarget.latestApplication?.artistName || dismissTarget.name}</strong> back
                                to a regular user. They will lose all producer permissions (sample uploads, preset creation)
                                and access to producer-only features.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDismissTarget(null)}
                                    disabled={dismissing}
                                    className="flex-1 py-3 bg-white/5 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDismissProducer}
                                    disabled={dismissing}
                                    className="flex-1 py-3 bg-yellow-500 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {dismissing ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Dismissing...</>
                                    ) : (
                                        <><UserMinus className="w-4 h-4" /> Dismiss</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-8 right-8 z-[300] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl ${
                            toast.type === "success"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// --- Sub-Components ---

const ProducerRow = ({
    producer,
    onDismiss,
}: {
    producer: Producer;
    onDismiss: (producer: Producer) => void;
    router: ReturnType<typeof useRouter>;
}) => {
    return (
        <motion.div
            variants={itemVar}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-6 bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all items-center rounded-[2rem]"
        >
            {/* Identity */}
            <div className="col-span-12 md:col-span-3">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-main text-primary border border-primary/20 text-lg">
                        {(producer.artistName || producer.name).charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-white text-sm leading-none mb-1 truncate">
                            {producer.artistName || `${producer.name} ${producer.surname || ""}`}
                        </h3>
                        <p className="text-[10px] font-mono text-white/40 uppercase truncate">@{producer.username}</p>
                    </div>
                </div>
            </div>

            {/* Email */}
            <div className="col-span-6 md:col-span-3 flex items-center gap-2 text-sm text-white/50 overflow-hidden">
                <span className="truncate">{producer.email}</span>
            </div>

            {/* Country */}
            <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-sm text-white/60">
                <Globe className="w-3 h-3 opacity-50" />
                <span className="truncate">{producer.country || "—"}</span>
            </div>

            {/* Verified Since */}
            <div className="col-span-6 md:col-span-2 text-xs font-mono text-white/40">
                {producer.approvedAt
                    ? new Date(producer.approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
            </div>

            {/* Actions */}
            <div className="col-span-12 md:col-span-2 flex justify-end gap-2">
                <button
                    onClick={() => onDismiss(producer)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/20 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/20 transition-all opacity-0 group-hover:opacity-100"
                >
                    <UserMinus className="w-3 h-3" />
                    Dismiss
                </button>
            </div>
        </motion.div>
    );
};
