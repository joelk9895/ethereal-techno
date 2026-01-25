"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileAudio, FileMusic, FileVolume, CreditCard } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { motion } from "framer-motion";
import Loading from "@/app/components/general/loading";

interface StatBoxProps {
    label: string;
    value: string;
    highlight?: boolean;
}

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
}

interface Order {
    id: string;
    date: string;
    product: string;
    amount: number;
    downloadUrl: string | null;
}



const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function ProducerOverviewPage() {
    const router = useRouter();
    const [producer, setProducer] = useState<ProducerData | null>(null);
    interface Upload {
        id: string;
        name: string;
        type: string;
        status: "pending" | "approved" | "rejected";
        createdAt: string;
    }

    const [uploads, setUploads] = useState<Upload[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Profile (for personalized greeting)
            const profileRes = await authenticatedFetch("/api/producer/profile");
            if (profileRes.ok) {
                const data = await profileRes.json();
                setProducer(data.producer);
            }

            // 2. Fetch Uploads
            const uploadsRes = await authenticatedFetch("/api/producer/uploads");
            if (uploadsRes.ok) {
                const data = await uploadsRes.json();
                setUploads(data.uploads);
            }

            // 3. Fetch Orders (for revenue)
            const ordersRes = await authenticatedFetch("/api/producer/orders");
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(data.orders);
            }

            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-none space-y-8 pt-24"
        >
            {/* HERO SECTION */}
            <div className="flex flex-col gap-2 mb-12">
                <h2 className="font-main text-5xl md:text-7xl uppercase text-white tracking-tight">
                    Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"},<br />
                    <span className="text-white/40">{producer?.artistName || producer?.name || "Producer"}</span>.
                </h2>
            </div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-96">

                {/* Main Card: Upload New */}
                <div
                    onClick={() => router.push('/artist/import')}
                    className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-10 flex flex-col justify-between hover:bg-zinc-900/80 transition-all duration-500 cursor-pointer"
                >
                    <div className="z-10 relative">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="font-main text-4xl uppercase mb-2">New Release</h3>
                        <p className="text-white/50 text-lg max-w-md">Upload your latest samples, presets, or loop kits for review.</p>
                    </div>
                    <div className="z-10 relative mt-8">
                        <span className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                            Start Upload <span className="text-primary">-&gt;</span>
                        </span>
                    </div>
                    {/* Abstract BG */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700" />
                </div>

                {/* Right Column: Stats Widget */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Stat 1 */}
                    <div className="flex-1 rounded-[2.5rem] bg-white/5 border border-white/5 p-8 flex flex-col justify-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="relative z-10">
                            <span className="text-sm font-mono uppercase tracking-widest text-white/40 block mb-2">Catalog Items</span>
                            <div className="font-main text-5xl text-white">{uploads.length}</div>
                            <div className="text-green-400 text-sm font-mono mt-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Active
                            </div>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="flex-1 rounded-[2.5rem] bg-white/5 border border-white/5 p-8 flex flex-col justify-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="relative z-10">
                            <span className="text-sm font-mono uppercase tracking-widest text-white/40 block mb-2">Total Revenue</span>
                            <div className="font-main text-5xl text-white">
                                ${orders.reduce((acc, order) => acc + order.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <div className="w-16 h-16 rounded-full border-4 border-green-500/50 flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECENT RELEASES (Catalog View) */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="font-main text-2xl uppercase">Latest Uploads</h3>
                    <button className="text-xs font-mono uppercase tracking-widest text-primary hover:text-white transition-colors">View Catalog</button>
                </div>

                <div className="w-full bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-md">
                    {uploads.length === 0 ? (
                        <div className="p-8 text-center text-white/40 font-mono uppercase tracking-widest text-sm">
                            No uploads found. Start by creating a new release.
                        </div>
                    ) : (
                        uploads.map((file, index) => (
                            <div
                                key={file.id}
                                className={`group grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer ${index !== uploads.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                {/* Art & Title */}
                                <div className="col-span-12 md:col-span-9 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/50 group-hover:scale-105 transition-transform`}>
                                        {file.type.includes("Audio") || file.type.includes("Loop") || file.type.includes("One-Shot") ? <FileAudio className="w-5 h-5" /> :
                                            file.type.includes("MIDI") ? <FileMusic className="w-5 h-5" /> : <FileVolume className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base text-white group-hover:text-primary transition-colors">{file.name}</span>
                                        <span className="text-xs text-white/40">{file.type}</span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="col-span-3 text-sm font-mono text-white/30 hidden md:flex justify-end">
                                    {new Date(file.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}