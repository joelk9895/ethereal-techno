"use client";

import { Play, ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface MarketplaceItem {
    id: number;
    title: string;
    subtitle: string;
    image: string;
}

interface Producer {
    id: string;
    artistName: string | null;
    username: string;
    artistPhoto: string | null;
}

const sections = [
    {
        title: "New Packs",
        items: [
            { id: 1, title: "Ethereal Rhythms", subtitle: "Lunar Echo", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop" },
            { id: 2, title: "Deep Tech Tools", subtitle: "System 42", image: "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?q=80&w=1000&auto=format&fit=crop" },
            { id: 3, title: "Analog Dreams", subtitle: "Synthwave Collective", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop" },
            { id: 4, title: "Ambient Textures", subtitle: "Voidwalker", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop" },
            { id: 5, title: "Glitch Percussion", subtitle: "Err0r", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop" },
        ]
    }
];

export default function MarketplaceHome() {
    const router = useRouter();
    const [producers, setProducers] = useState<Producer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducers = async () => {
            try {
                const res = await fetch("/api/producers");
                if (res.ok) {
                    const data = await res.json();
                    setProducers(data.producers || []);
                }
            } catch (e) {
                console.error("Failed to fetch producers", e);
            } finally {
                setLoading(false);
            }
        };
        fetchProducers();
    }, []);

    return (
        <div className="w-full h-full pb-20 select-none">

            {/* Header */}
            <div className="flex items-center justify-start mb-8 px-1">
                <h1 className="font-main text-4xl md:text-5xl lowercase text-white">Home</h1>
            </div>

            <div className="space-y-16">

                {/* Hero / New Packs */}
                <Section title={sections[0].title}>
                    {sections[0].items.map((item) => (
                        <Card key={item.id} item={item} />
                    ))}
                </Section>

                {/* Verified Producers - Circular */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Verified Producers <ChevronRight className="w-5 h-5 text-neutral-500" />
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex gap-6 overflow-hidden px-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-4 w-32">
                                    <div className="w-32 h-32 rounded-full bg-white/5 animate-pulse" />
                                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
                            {producers.length > 0 ? producers.map((producer) => (
                                <div
                                    key={producer.id}
                                    onClick={() => router.push(`/artist/${producer.username}`)}
                                    className="snap-start shrink-0 flex flex-col items-center gap-3 w-32 group cursor-pointer"
                                >
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:border-primary/50 bg-zinc-800">
                                        {producer.artistPhoto ? (
                                            <Image
                                                src={producer.artistPhoto}
                                                alt={producer.artistName || producer.username}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-3xl bg-gradient-to-br from-white/5 to-transparent">
                                                {(producer.artistName || producer.username)[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate w-full text-center">
                                        {producer.artistName || producer.username}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-white/40 text-sm font-mono px-1">No verified producers found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Join The Circle CTA */}
                <JoinCircleCTA router={router} />

            </div>
        </div>
    );
}

// Subcomponents

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors">
                    {title} <ChevronRight className="w-5 h-5 text-neutral-500" />
                </h2>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0"
            >
                {children}
            </div>
        </div>
    );
};

const Card = ({ item }: { item: MarketplaceItem }) => (
    <div className="snap-start shrink-0 w-44 md:w-56 group cursor-pointer relative">
        <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-neutral-800 border border-white/5 shadow-lg group-hover:shadow-2xl transition-all duration-300">
            <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-1" />
                </div>
            </div>
        </div>
        <h3 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-xs text-white/50 truncate">{item.subtitle}</p>
    </div>
);

const JoinCircleCTA = ({ router }: { router: ReturnType<typeof useRouter> }) => (
    <motion.button
        onClick={() => router.push("/community")}
        whileHover="hover"
        initial="initial"
        className="group relative w-full py-24 md:py-32 border-y border-white/10 hover:border-primary/50 transition-colors overflow-hidden mt-12"
    >
        <motion.div variants={{ initial: { scaleY: 0 }, hover: { scaleY: 1 } }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 bg-primary/10 origin-bottom -z-10" />
        <div className="flex flex-col items-center gap-6">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Community Hub</span>
            <div className="flex items-center gap-6 md:gap-12">
                <h2 className="font-main text-6xl md:text-8xl leading-[0.9] uppercase text-white group-hover:text-primary transition-colors duration-300">Join The Circle</h2>
                <ArrowUpRight className="w-10 h-10 md:w-20 md:h-20 text-white/30 group-hover:text-primary transition-colors duration-300" />
            </div>
        </div>
    </motion.button>
);
