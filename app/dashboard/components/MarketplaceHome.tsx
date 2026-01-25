"use client";

import { Play, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface MarketplaceItem {
    id: number;
    title: string;
    subtitle: string;
    image: string;
}

const sections = [
    {
        title: "New & Noteworthy",
        items: [
            { id: 1, title: "Ethereal Rhythms", subtitle: "Lunar Echo", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop" },
            { id: 2, title: "Deep Tech Tools", subtitle: "System 42", image: "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?q=80&w=1000&auto=format&fit=crop" },
            { id: 3, title: "Analog Dreams", subtitle: "Synthwave Collective", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop" },
            { id: 4, title: "Ambient Textures", subtitle: "Voidwalker", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop" },
            { id: 5, title: "Glitch Percussion", subtitle: "Err0r", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop" },
        ]
    },
    {
        title: "Made For You",
        items: [
            { id: 6, title: "Vocal Chops 002", subtitle: "Aria", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop" },
            { id: 7, title: "Bass Heavy", subtitle: "Low End Theory", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop" },
            { id: 8, title: "Abstract Noise", subtitle: "Signal", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop" },
            { id: 9, title: "Minimal Loops", subtitle: "Click", image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop" },
        ]
    }
];

const artists = [
    { id: 1, name: "Lunar Echo", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&fit=crop" },
    { id: 2, name: "System 42", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&fit=crop" },
    { id: 3, name: "Aria", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&fit=crop" },
    { id: 4, name: "Voidwalker", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&fit=crop" },
    { id: 5, name: "Err0r", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&fit=crop" },
    { id: 6, name: "Synthwave", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&fit=crop" },
    { id: 7, name: "Signal", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=400&fit=crop" },
];

export default function MarketplaceHome() {
    return (
        <div className="w-full h-full pb-20 select-none">

            {/* Header */}
            <div className="flex items-center justify-start mb-8 px-1">
                <h1 className="font-main text-4xl md:text-5xl lowercase text-white">Home</h1>

            </div>

            <div className="space-y-12">

                {/* Hero / New & Noteworthy */}
                <Section title={sections[0].title}>
                    {sections[0].items.map((item) => (
                        <Card key={item.id} item={item} />
                    ))}
                </Section>

                {/* Verified Artists - Circular */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Verified Artists <ChevronRight className="w-5 h-5 text-neutral-500" />
                        </h2>
                    </div>
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
                        {artists.map((artist) => (
                            <div key={artist.id} className="snap-start shrink-0 flex flex-col items-center gap-3 w-32 group cursor-pointer">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                    <Image
                                        src={artist.image}
                                        alt={artist.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate w-full text-center">
                                    {artist.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Made For You */}
                <Section title={sections[1].title}>
                    {sections[1].items.map((item) => (
                        <Card key={item.id} item={item} />
                    ))}
                </Section>

            </div>
        </div>
    );
}

// Subcomponents

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="space-y-4">
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
