"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Download,
    Music,
    Disc,
    Volume2,
    Search,
    ListFilter,
    Database,
    HardDrive,
    Clock
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface FreeContent {
    id: string;
    title: string;
    type: "SAMPLE" | "SERUM" | "DIVA";
    artist: {
        name: string;
        artistName: string;
    };
    fileSize: number;
    downloads: number;
    s3Url: string;
    createdAt: string;
}

interface FilterTabProps {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    active: boolean;
    onClick: () => void;
}

interface VaultRowProps {
    item: FreeContent;
    onDownload: () => void;
}

// --- Animation Variants ---
const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVar = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

export default function FreeContentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<FreeContent[]>([]);
    const [filteredContent, setFilteredContent] = useState<FreeContent[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const filterContent = useCallback(() => {
        let filtered = content;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.artist.name.toLowerCase().includes(query) ||
                    item.artist.artistName.toLowerCase().includes(query)
            );
        }
        if (typeFilter !== "all") {
            filtered = filtered.filter((item) => item.type === typeFilter);
        }
        setFilteredContent(filtered);
    }, [content, searchQuery, typeFilter]);

    useEffect(() => {
        const authUser = getAuthUser();
        if (!authUser) {
            router.push("/signin");
            return;
        }
        // Check if user is verified producer
        if (authUser.type !== "ARTIST" && authUser.type !== "ADMIN") {
            router.push("/free");
            return;
        }

        // --- MOCK DATA FOR PREVIEW (Replace with actual fetch below) ---
        const mockData: FreeContent[] = [
            { id: "1", title: "Deep Horizon", type: "SERUM", artist: { name: "Test", artistName: "AEON" }, fileSize: 1024 * 1024 * 2.5, downloads: 124, s3Url: "#", createdAt: new Date().toISOString() },
            { id: "2", title: "Ethereal Kicks Vol. 1", type: "SAMPLE", artist: { name: "Test", artistName: "NOVA" }, fileSize: 1024 * 1024 * 45, downloads: 892, s3Url: "#", createdAt: new Date().toISOString() },
            { id: "3", title: "Analog Dreams", type: "DIVA", artist: { name: "Test", artistName: "KOLLEKTIV" }, fileSize: 1024 * 1024 * 1.2, downloads: 56, s3Url: "#", createdAt: new Date().toISOString() },
            { id: "4", title: "Astral Pads", type: "SERUM", artist: { name: "Test", artistName: "AEON" }, fileSize: 1024 * 1024 * 3.1, downloads: 210, s3Url: "#", createdAt: new Date().toISOString() },
            { id: "5", title: "Techno Rumble Kit", type: "SAMPLE", artist: { name: "Test", artistName: "UNKNOWN" }, fileSize: 1024 * 1024 * 120, downloads: 1400, s3Url: "#", createdAt: new Date().toISOString() },
        ];
        setContent(mockData);
        setFilteredContent(mockData);
        setLoading(false);

        // Uncomment for real API usage
        // fetchFreeContent();
    }, [router]);

    useEffect(() => {
        filterContent();
    }, [filterContent]);

    // Note: This function is kept for when real API is implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fetchFreeContent = async () => {
        try {
            const response = await fetch("/api/free", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch content");
            const data = await response.json();
            setContent(data.content);
        } catch (error) {
            console.error("Error fetching content:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (itemId: string, url: string, title: string) => {
        // Add download logic/toast here
        console.log(`Downloading ${title}...`);
        // window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-primary">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <span className="text-xs font-mono tracking-widest">ACCESSING VAULT...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">

            {/* --- Background Noise & Ambient --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            {/* --- Main Content --- */}
            <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-20">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <Database className="w-4 h-4" />
                            <span className="text-[10px] font-mono tracking-widest uppercase">
                                Asset Database // V.2.0
                            </span>
                        </div>
                        <h1 className="font-main text-[12vw] md:text-[7vw] leading-[0.8] uppercase text-white">
                            The Vault
                        </h1>
                    </div>

                    {/* Stats Block */}
                    <div className="flex gap-8 border-l border-white/10 pl-6">
                        <div>
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Total Assets</div>
                            <div className="font-main text-2xl">{content.length}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Available Space</div>
                            <div className="font-main text-2xl">∞</div>
                        </div>
                    </div>
                </header>

                {/* Toolbar (Search & Filter) */}
                <div className="sticky top-8 z-50 mb-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-none md:rounded-full p-2 flex flex-col md:flex-row gap-4 md:items-center">

                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH DATABASE..."
                            className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-mono text-white placeholder:text-white/30 focus:outline-none uppercase tracking-wide"
                        />
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-8 bg-white/10"></div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0 px-2 md:px-0">
                        <FilterTab label="ALL" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                        <FilterTab label="SAMPLES" icon={Music} active={typeFilter === "SAMPLE"} onClick={() => setTypeFilter("SAMPLE")} />
                        <FilterTab label="SERUM" icon={Disc} active={typeFilter === "SERUM"} onClick={() => setTypeFilter("SERUM")} />
                        <FilterTab label="DIVA" icon={Volume2} active={typeFilter === "DIVA"} onClick={() => setTypeFilter("DIVA")} />
                    </div>
                </div>

                {/* Table Header (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                    <div className="col-span-1">Type</div>
                    <div className="col-span-5">Title / Artist</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Content List */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={typeFilter + searchQuery}
                        variants={containerVar}
                        initial="hidden"
                        animate="show"
                        className="space-y-1"
                    >
                        {filteredContent.length === 0 ? (
                            <motion.div
                                variants={itemVar}
                                className="py-24 text-center border border-dashed border-white/10 rounded-lg"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
                                    <ListFilter className="w-5 h-5 text-white/30" />
                                </div>
                                <p className="text-white/40 font-mono text-sm">NO ASSETS FOUND</p>
                            </motion.div>
                        ) : (
                            filteredContent.map((item) => (
                                <VaultRow
                                    key={item.id}
                                    item={item}
                                    onDownload={() => handleDownload(item.id, item.s3Url, item.title)}
                                />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    );
}

// --- Sub-Components ---

const FilterTab: React.FC<FilterTabProps> = ({ label, icon: Icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap
            ${active
                ? "bg-primary text-black shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }
        `}
    >
        {Icon && <Icon className="w-3 h-3" />}
        {label}
    </button>
);

const VaultRow: React.FC<VaultRowProps> = ({ item, onDownload }) => {
    // Helper to format bytes
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper for type aesthetic
    const getTypeColor = (type: string) => {
        switch (type) {
            case "SERUM": return "text-purple-400";
            case "DIVA": return "text-pink-400";
            default: return "text-blue-400";
        }
    };

    return (
        <motion.div
            variants={itemVar}
            className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:px-6 md:py-5 bg-white/[0.02] border border-white/[0.05] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 rounded-lg items-center"
        >
            {/* Type Icon */}
            <div className="col-span-1 flex items-center">
                <div className={`w-8 h-8 rounded flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:text-primary transition-colors ${getTypeColor(item.type)}`}>
                    {item.type === "SERUM" ? <Disc className="w-4 h-4" /> :
                        item.type === "DIVA" ? <Volume2 className="w-4 h-4" /> :
                            <Music className="w-4 h-4" />}
                </div>
            </div>

            {/* Title & Artist */}
            <div className="col-span-12 md:col-span-5">
                <h3 className="font-main text-2xl md:text-3xl uppercase text-white group-hover:text-primary transition-colors leading-none mb-1">
                    {item.title}
                </h3>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
                    By {item.artist.artistName || item.artist.name}
                </p>
            </div>

            {/* Meta Info (Date) */}
            <div className="hidden md:flex col-span-2 items-center text-white/30 text-xs font-mono gap-2">
                <Clock className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
            </div>

            {/* Meta Info (Size) */}
            <div className="hidden md:flex col-span-2 items-center text-white/30 text-xs font-mono gap-2">
                <HardDrive className="w-3 h-3" />
                {formatBytes(item.fileSize)}
            </div>

            {/* Action Button */}
            <div className="col-span-12 md:col-span-2 flex justify-end">
                <button
                    onClick={onDownload}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 md:py-2 bg-white/5 border border-white/10 hover:bg-primary hover:border-primary hover:text-black text-white text-xs font-bold uppercase tracking-widest rounded transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                >
                    <span>Download</span>
                    <Download className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};