"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Loader2,
    Download,
    Play,
    Search,
    Music,
    LayoutGrid,
    List
} from "lucide-react";
import { getAuthUser, logout, authenticatedFetch } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import RightSidebar from "@/app/components/RightSidebar";

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
    artworkUrl?: string | null;
    shortDescription?: string | null;
}

interface FilterTabProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

interface VaultRowProps {
    item: FreeContent;
    onDownload: () => void;
}

interface ProducerData {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    type: string;
    artistName?: string;
    artistPhoto?: string | null;
    country: string | null;
    createdAt: string;
    approvedAt: string;
}

// --- Animation Variants ---
const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03
        }
    }
};

const itemVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } }
};

export default function FreeContentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [producer, setProducer] = useState<ProducerData | null>(null);
    const [content, setContent] = useState<FreeContent[]>([]);
    const [filteredContent, setFilteredContent] = useState<FreeContent[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
        if (authUser.type !== "ARTIST" && authUser.type !== "ADMIN") {
            router.push("/free");
            return;
        }

        const fetchProducerAndContent = async () => {
            try {
                const profileRes = await authenticatedFetch("/api/producer/profile");
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProducer(data.producer);
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            }

            // try {
            //     const packsRes = await authenticatedFetch("/api/free-packs");
            //     if (packsRes.ok) {
            //         const data = await packsRes.json();
            //         if (data.success) {
            //             setContent(data.packs);
            //             setFilteredContent(data.packs);
            //         }
            //     }
            // } catch (err) {
            //     console.error("Error fetching free packs", err);
            // }

            // --- MOCK DATA FOR PREVIEW ---
            const mockData: FreeContent[] = [
                { id: "1", title: "Deep Horizon", type: "SERUM", artist: { name: "Test", artistName: "AEON" }, fileSize: 1024 * 1024 * 2.5, downloads: 124, s3Url: "#", createdAt: new Date().toISOString(), artworkUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", shortDescription: "Atmospheric and deep techno serum presets." },
                { id: "2", title: "Ethereal Kicks Vol. 1", type: "SAMPLE", artist: { name: "Test", artistName: "NOVA" }, fileSize: 1024 * 1024 * 45, downloads: 892, s3Url: "#", createdAt: new Date().toISOString(), artworkUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop", shortDescription: "Heavy, rumbling kicks for club systems." },
                { id: "3", title: "Analog Dreams", type: "DIVA", artist: { name: "Test", artistName: "KOLLEKTIV" }, fileSize: 1024 * 1024 * 1.2, downloads: 56, s3Url: "#", createdAt: new Date().toISOString(), artworkUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop", shortDescription: "Warm analog pads and leads." },
                { id: "4", title: "Astral Pads", type: "SERUM", artist: { name: "Test", artistName: "AEON" }, fileSize: 1024 * 1024 * 3.1, downloads: 210, s3Url: "#", createdAt: new Date().toISOString(), artworkUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop", shortDescription: "Ethereal soundscapes for melodic intros." },
                { id: "5", title: "Techno Rumble Kit", type: "SAMPLE", artist: { name: "Test", artistName: "UNKNOWN" }, fileSize: 1024 * 1024 * 120, downloads: 1400, s3Url: "#", createdAt: new Date().toISOString(), artworkUrl: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?q=80&w=2670&auto=format&fit=crop", shortDescription: "The essential kit for Warehouse techno." },
                { id: "6", title: "Hypnotic Loops", type: "SAMPLE", artist: { name: "Test", artistName: "NOVA" }, fileSize: 1024 * 1024 * 85, downloads: 300, s3Url: "#", createdAt: new Date().toISOString(), artworkUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", shortDescription: "Rolling, hypnotic synth and bass loops." },
                { id: "7", title: "Dark Atmosphere", type: "DIVA", artist: { name: "Test", artistName: "KOLLEKTIV" }, fileSize: 1024 * 1024 * 0.8, downloads: 90, s3Url: "#", createdAt: new Date().toISOString(), shortDescription: "No artwork provided for testing." },
            ];
            setContent(mockData);
            setFilteredContent(mockData);

            setLoading(false);
        }

        fetchProducerAndContent();
    }, [router]);

    useEffect(() => {
        filterContent();
    }, [filterContent]);

    const handleDownload = async (itemId: string, url: string, title: string) => {
        console.log(`Downloading ${title}...`);
    };

    const handleNavigation = (id: string) => {
        if (id === "free-content") return;
        if (id === "sounds") return router.push("/libraries");
        if (id === "bundles") return router.push("/bundles");
        if (id === "merch") return router.push("/merch");

        switch (id) {
            case "overview": router.push("/dashboard/producer"); break;
            case "profile": router.push("/dashboard/producer/profile"); break;
            case "billing": router.push("/dashboard/producer/billing"); break;
            case "orders": router.push("/dashboard/producer/orders"); break;
            default: router.push("/dashboard/producer");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-primary">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
            </div>
        );
    }

    if (!producer) return null;

    return (
        <div className="flex h-screen bg-background text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">

            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Minimal grain */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row-reverse w-full h-full">

                <RightSidebar
                    user={{ ...producer, type: "ARTIST" }}
                    activeTab="free-content"
                    onNavigate={handleNavigation}
                    onSignOut={() => logout().then(() => router.push("/signin"))}
                />

                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pb-32 lg:pb-12 no-scrollbar relative z-10">
                    <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col pt-24 px-6 md:px-12">

                        <header className="mb-8">
                            <h1 className="font-main text-5xl md:text-6xl text-white mb-6">
                                Free Packs
                            </h1>

                            {/* Minimal Controls */}
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-white/5 pb-4">
                                {/* Filter Tabs */}
                                <div className="flex flex-col md:flex-row gap-6 md:items-center w-full">
                                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar flex-1">
                                        <FilterTab label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                                        <FilterTab label="Samples" active={typeFilter === "SAMPLE"} onClick={() => setTypeFilter("SAMPLE")} />
                                        <FilterTab label="Serum" active={typeFilter === "SERUM"} onClick={() => setTypeFilter("SERUM")} />
                                        <FilterTab label="Diva" active={typeFilter === "DIVA"} onClick={() => setTypeFilter("DIVA")} />
                                    </div>

                                    <div className="flex items-center gap-4 border-l-0 md:border-l border-white/10 pl-0 md:pl-6">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "text-primary bg-white/5" : "text-white/40 hover:text-white"}`}
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "text-primary bg-white/5" : "text-white/40 hover:text-white"}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative group w-full md:w-64">
                                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search"
                                        className="w-full pl-8 py-2 bg-transparent text-sm font-light text-white placeholder:text-white/30 focus:outline-none transition-colors border-none"
                                    />
                                </div>
                            </div>
                        </header>

                        {/* Content View */}
                        <div className="flex-1 mt-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={typeFilter + searchQuery + viewMode}
                                    variants={containerVar}
                                    initial="hidden"
                                    animate="show"
                                    className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-0"}
                                >
                                    {filteredContent.length === 0 ? (
                                        <div className="py-24 col-span-full text-center text-white/30 font-light">
                                            No packs found.
                                        </div>
                                    ) : (
                                        viewMode === "grid" ? (
                                            filteredContent.map((item) => (
                                                <VaultGridItem
                                                    key={item.id}
                                                    item={item}
                                                    onDownload={() => handleDownload(item.id, item.s3Url, item.title)}
                                                />
                                            ))
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-12 gap-4 px-4 pb-4 border-b border-white/5 text-[10px] font-medium text-white/30 uppercase tracking-widest mb-4">
                                                    <div className="col-span-12 md:col-span-7 pl-[3.25rem]">Pack</div>
                                                    <div className="hidden md:block col-span-3">Type</div>
                                                    <div className="col-span-3 md:col-span-2 text-right"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    {filteredContent.map((item) => (
                                                        <VaultRow
                                                            key={item.id}
                                                            item={item}
                                                            onDownload={() => handleDownload(item.id, item.s3Url, item.title)}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}


const FilterTab: React.FC<FilterTabProps> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            text-sm font-medium transition-colors
            ${active ? "text-primary" : "text-white/40 hover:text-white"}
        `}
    >
        {label}
    </button>
);

const VaultRow: React.FC<VaultRowProps> = ({ item, onDownload }) => {
    // Helper for type color - subtle
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
            className="group grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/5 transition-colors rounded-lg border-b border-white/[0.02] last:border-none"
        >
            {/* Artwork / Icon */}
            <div className="col-span-12 md:col-span-7 flex items-center gap-4">
                <div className="relative w-10 h-10 flex-shrink-0 bg-white/5 rounded-md overflow-hidden text-white/40 group-hover:text-white transition-colors flex items-center justify-center">
                    {item.artworkUrl ? (
                        <Image src={item.artworkUrl} alt={item.title} fill className="object-cover" />
                    ) : (
                        <Music className="w-5 h-5" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                </div>

                <div className="flex flex-col justify-center min-w-0">
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                        {item.title}
                    </span>
                    {item.shortDescription ? (
                        <span className="text-xs text-white/40 truncate">
                            {item.shortDescription}
                        </span>
                    ) : (
                        <span className="text-xs text-white/40 truncate">
                            By {item.artist.artistName || item.artist.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Type */}
            <div className="hidden md:flex col-span-3 items-center">
                <span className={`text-xs font-medium ${getTypeColor(item.type)} opacity-80 uppercase tracking-wider`}>
                    {item.type}
                </span>
            </div>

            {/* Action */}
            <div className="col-span-3 md:col-span-2 flex justify-end">
                <button
                    onClick={onDownload}
                    className="p-2 rounded-full text-primary hover:bg-white/10 transition-colors"
                    title="Download"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

const VaultGridItem: React.FC<VaultRowProps> = ({ item, onDownload }) => {
    return (
        <motion.div
            variants={itemVar}
            className="group flex flex-col relative"
        >
            {/* Artwork Container */}
            <div className="relative aspect-square w-full bg-white/5 rounded-xl overflow-hidden mb-4 border border-white/5 group-hover:border-white/20 transition-colors">
                {item.artworkUrl ? (
                    <Image src={item.artworkUrl} alt={item.title} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20">
                        <Music className="w-12 h-12" />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-1" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(); }}
                        className="w-12 h-12 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:border-white transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Title & Artist & Type */}
            <div className="px-1 text-center md:text-left">
                <h3 className="text-sm font-medium text-white truncate mb-1" title={item.title}>{item.title}</h3>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                    <p className="text-xs text-white/50 truncate">By {item.artist.artistName || item.artist.name}</p>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{item.type}</span>
                </div>
            </div>
        </motion.div>
    );
};