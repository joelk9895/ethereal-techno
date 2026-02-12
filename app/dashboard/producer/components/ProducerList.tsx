"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, MessageSquare, Eye, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
// import Image from "next/image";
import { useRef } from "react";

import { useRouter } from "next/navigation";

interface Producer {
    id: string;
    artistName: string | null;
    username: string;
    artistPhoto: string | null;
    profileViews: number;
    messageClicks: number;
    city: string | null;
    country: string | null;
}

export default function ProducerList() {
    const router = useRouter();
    const [producers, setProducers] = useState<Producer[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProducers();
    }, []);

    const fetchProducers = async () => {
        try {
            const res = await fetch("/api/producers");
            if (res.ok) {
                const data = await res.json();
                setProducers(data.producers);
            }
        } catch (e) {
            console.error("Failed to fetch producers", e);
        } finally {
            setLoading(false);
        }
    };

    const handleInteraction = async (producerId: string, type: 'view' | 'click') => {
        try {
            // Optimistic update
            setProducers(prev => prev.map(p => {
                if (p.id === producerId) {
                    return {
                        ...p,
                        profileViews: type === 'view' ? (p.profileViews || 0) + 1 : p.profileViews,
                        messageClicks: type === 'click' ? (p.messageClicks || 0) + 1 : p.messageClicks
                    }
                }
                return p;
            }).sort((a, b) => {
                const scoreA = (a.profileViews || 0) + (a.messageClicks || 0);
                const scoreB = (b.profileViews || 0) + (b.messageClicks || 0);
                return scoreB - scoreA;
            }));

            await fetch("/api/producers/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ producerId, interactionType: type })
            });

        } catch (e) {
            console.error("Interaction error", e);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-4">
                    <div className="w-40 h-40 rounded-full bg-white/5 animate-pulse" />
                    <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="relative group/container">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4 text-white/50 uppercase tracking-widest text-base font-mono">
                    <User className="w-5 h-5" />
                    <span>Verified Producers</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/container:opacity-100 transition-opacity">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex items-start gap-8 overflow-x-auto pb-8 no-scrollbar scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {producers.map((producer, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={producer.id}
                        onClick={() => {
                            handleInteraction(producer.id, 'view');
                            router.push(`/artist/${producer.username}`);
                        }}
                        className="flex-shrink-0 group flex flex-col items-center gap-4 cursor-pointer w-40"
                    >
                        {/* Avatar */}
                        <div className="relative w-40 h-40">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-800 border border-white/5 group-hover:scale-105 transition-transform duration-500 shadow-2xl group-hover:border-primary/50">
                                {producer.artistPhoto ? (
                                    <img
                                        src={producer.artistPhoto}
                                        alt={producer.artistName || producer.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-3xl bg-gradient-to-br from-white/5 to-transparent">
                                        {(producer.artistName || producer.username)[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Online/Verified Badge */}
                            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black flex items-center justify-center border border-black/50">
                                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                            </div>

                            {/* Hover Action Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleInteraction(producer.id, 'click');
                                    }}
                                    className="scale-90 group-hover:scale-100 transition-transform duration-300 p-3 rounded-full bg-primary text-black transform"
                                >
                                    <MessageSquare className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center space-y-1">
                            <h5 className="font-main text-lg text-white group-hover:text-primary transition-colors truncate max-w-[160px]">
                                {producer.artistName || producer.username}
                            </h5>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider truncate max-w-[140px]">
                                    {producer.city || producer.country || "Earth"}
                                </span>

                                <div className="flex items-center gap-3 opacity-40 text-[9px] font-mono text-white">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-2.5 h-2.5" />
                                        {producer.profileViews}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-2.5 h-2.5" />
                                        {producer.messageClicks}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {producers.length === 0 && (
                    <div className="w-full flex justify-center py-12 text-white/30 font-mono uppercase">
                        No producers found.
                    </div>
                )}
            </div>
        </div>
    )
}
