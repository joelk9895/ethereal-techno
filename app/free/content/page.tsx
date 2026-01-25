"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Download,
    Play,
    Search,
    Music
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

            // --- MOCK DATA FOR PREVIEW ---
            const mockData: FreeContent[] = [
                { id: "1", title: "Deep Horizon", type: "SERUM", artist: { name: "Test", artistName: "AEON" }, fileSize: 1024 * 1024 * 2.5, downloads: 124, s3Url: "#", createdAt: new Date().toISOString() },
                { id: "2", title: "Ethereal Kicks Vol. 1", type: "SAMPLE", artist: { name: "Test", artistName: "NOVA" }, fileSize: 1024 * 1024 * 45, downloads: 892, s3Url: "#", createdAt: new Date().toISOString() },
                { id: "3", title: "Analog Dreams", type: "DIVA", artist: { name: "Test", artistName: "KOLLEKTIV" }, fileSize: 1024 * 1024 * 1.2, downloads: 56, s3Url: "#", createdAt: new Date().toISOString() },
                { id: "4", title: "Astral Pads", type: "SERUM", artist: { name: "Test", artistName: "AEON" }, fileSize: 1024 * 1024 * 3.1, downloads: 210, s3Url: "#", createdAt: new Date().toISOString() },
                { id: "5", title: "Techno Rumble Kit", type: "SAMPLE", artist: { name: "Test", artistName: "UNKNOWN" }, fileSize: 1024 * 1024 * 120, downloads: 1400, s3Url: "#", createdAt: new Date().toISOString() },
                { id: "6", title: "Hypnotic Loops", type: "SAMPLE", artist: { name: "Test", artistName: "NOVA" }, fileSize: 1024 * 1024 * 85, downloads: 300, s3Url: "#", createdAt: new Date().toISOString() },
                { id: "7", title: "Dark Atmosphere", type: "DIVA", artist: { name: "Test", artistName: "KOLLEKTIV" }, fileSize: 1024 * 1024 * 0.8, downloads: 90, s3Url: "#", createdAt: new Date().toISOString() },
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
        if (id === "community") {
            router.push("/community");
            return;
        }

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
                                Free Content
                            </h1>

                            {/* Minimal Controls */}
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-white/5 pb-4">
                                {/* Filter Tabs */}
                                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                                    <FilterTab label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                                    <FilterTab label="Samples" active={typeFilter === "SAMPLE"} onClick={() => setTypeFilter("SAMPLE")} />
                                    <FilterTab label="Serum" active={typeFilter === "SERUM"} onClick={() => setTypeFilter("SERUM")} />
                                    <FilterTab label="Diva" active={typeFilter === "DIVA"} onClick={() => setTypeFilter("DIVA")} />
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

                        {/* List View */}
                        <div className="flex-1">
                            <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-white/5 text-[10px] font-medium text-white/30 uppercase tracking-widest mb-2">
                                <div className="col-span-1"></div>
                                <div className="col-span-8 md:col-span-6">Title</div>
                                <div className="hidden md:block col-span-3">Type</div>
                                <div className="col-span-3 md:col-span-2 text-right"></div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={typeFilter + searchQuery}
                                    variants={containerVar}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-0"
                                >
                                    {filteredContent.length === 0 ? (
                                        <div className="py-24 text-center text-white/30 font-light">
                                            No content found.
                                        </div>
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
            {/* Play/Icon */}
            <div className="col-span-1 flex items-center justify-center">
                <div className="relative w-8 h-8 flex items-center justify-center bg-white/5 rounded-md text-white/40 group-hover:text-white transition-colors">
                    <Music className="w-4 h-4" />
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <Play className="w-3 h-3 fill-current" />
                    </div>
                </div>
            </div>

            {/* Title & Artist */}
            <div className="col-span-8 md:col-span-6 flex flex-col justify-center">
                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                    {item.title}
                </span>
                <span className="text-xs text-white/40 truncate">
                    {item.artist.artistName || item.artist.name}
                </span>
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