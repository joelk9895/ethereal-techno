"use client";

import { motion } from "framer-motion";
import { Download, ChevronRight } from "lucide-react";
import Image from "next/image";

const mockLibraryItems = [
    { id: 1, title: "Ethereal Echoes", artist: "Lunar Systems", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&fit=crop", type: "Sample Loop", size: "1.2 GB", format: "WAV" },
    { id: 2, title: "Midnight Frequencies", artist: "Voidwalker", image: "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?q=80&w=600&fit=crop", type: "Preset", size: "45 MB", format: "FXP" },
    { id: 3, title: "Synthetic Dreams", artist: "Analog Soul", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&fit=crop", type: "Construction Kit", size: "850 MB", format: "WAV" },
    { id: 4, title: "Deep Space Signals", artist: "Nebula", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&fit=crop", type: "MIDI", size: "15 KB", format: "MID" },
    { id: 5, title: "Glitch Patterns", artist: "Err0r", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&fit=crop", type: "One-Shot", size: "320 MB", format: "WAV" },
    { id: 6, title: "Ambient Works Vol. 1", artist: "Cloud 9", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600&fit=crop", type: "Sample Loop", size: "2.1 GB", format: "WAV" },
    { id: 7, title: "Bass Theory", artist: "Low Frequency", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&fit=crop", type: "Preset", size: "12 MB", format: "FXP" },
    { id: 8, title: "Industrial Noise", artist: "Factory", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&fit=crop", type: "Sample Loop+MIDI", size: "640 MB", format: "WAV" },
];

interface LibraryItem {
    id: number;
    title: string;
    artist: string;
    image: string;
    type: string;
    size: string;
    format: string;
}

const LibraryCard = ({ item }: { item: LibraryItem }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1E1E1E] mb-4 border border-white/5 shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300">
            <div className="absolute top-3 left-3 z-20 flex gap-2">
                <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.format}
                </div>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                    <Download className="w-3.5 h-3.5" />
                    Download
                </button>
                <span className="text-white/60 text-xs font-mono uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                    {item.size}
                </span>
            </div>
            <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
        </div>
        <div>
            <h3 className="text-white font-bold text-base truncate mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
            <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider truncate">{item.artist}</p>
                <p className="hidden md:block text-white/20 text-[10px] font-mono uppercase tracking-widest">{item.type}</p>
            </div>
        </div>
    </div>
);

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function DashboardLibraryPage() {
    return (
        <motion.div
            key="library"
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
        >
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-2">My Library</h2>
                    <p className="text-white/50 text-lg font-light">Your purchased sounds, presets, and active subscriptions.</p>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {mockLibraryItems.map((item) => (
                    <LibraryCard key={item.id} item={item} />
                ))}
            </div>
            <div className="mt-16 pt-8 border-t border-white/5 flex justify-center">
                <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest">
                    Load More <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
